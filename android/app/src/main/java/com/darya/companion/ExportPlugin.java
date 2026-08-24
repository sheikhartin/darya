package com.darya.companion;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Saves conversation transcripts to device storage for the web layer.
 *
 * The Android WebView has no download machinery: an anchor with a blob
 * URL and a download attribute (how the website exports) is a silent
 * no-op inside the shell. The web layer detects the native environment
 * (js/app/native.js) and calls this plugin instead.
 *
 * On Android 10 (API 29) and newer the primary target is the shared
 * Downloads collection through MediaStore, which needs no storage
 * permission. Some devices reject that write (a flaky Downloads
 * provider, a restricted storage state, or an OEM quirk); when that
 * happens the file is written to the app's own external Downloads
 * directory instead, which also needs no permission, and the web
 * layer reports that location honestly. A transcript is therefore
 * always saved somewhere, and the only failure left is a device with
 * no writable storage at all.
 *
 * On Android 9 and older only the app-owned directory path exists,
 * since the shared Downloads folder would require the legacy storage
 * permission there.
 *
 * Every fallback and failure is logged under the DaryaExport tag
 * (adb logcat -s DaryaExport) so a device that misbehaves can be
 * diagnosed without guessing.
 */
@CapacitorPlugin(name = "Export")
public class ExportPlugin extends Plugin {

    /** Location reported when the file was written to the shared Downloads collection. */
    static final String LOCATION_DOWNLOADS = "downloads";

    /** Location reported when the file was written to the app-owned directory. */
    static final String LOCATION_APP_FILES = "app-files";

    /** MIME type of a saved transcript. */
    private static final String TRANSCRIPT_MIME_TYPE = "text/plain";

    /**
     * Upper bound for a transcript payload. Real transcripts are tens
     * of kilobytes; long sessions with lots of Persian text (two UTF-8
     * bytes per character) can grow well past the old 2 MB cap, and
     * rejecting them pushed the export onto the weaker clipboard
     * fallback for no good reason. 16 MB still stops runaway input
     * from hogging memory while covering very long sessions.
     */
    private static final int MAX_CONTENT_BYTES = 16 * 1024 * 1024;

    /** Longest filename accepted, matching common filesystem limits. */
    private static final int MAX_FILENAME_LENGTH = 128;

    /** Fallback filename when the web layer sends none. */
    private static final String DEFAULT_FILENAME = "darya-chat.txt";

    /** Log tag for diagnostics (adb logcat -s DaryaExport). */
    private static final String LOG_TAG = "DaryaExport";

    /**
     * Saves a UTF-8 text file to device storage.
     * Options: filename (string), content (string).
     * Resolves with { uri, location } where location is 'downloads' or
     * 'app-files'.
     */
    @PluginMethod
    public void saveTranscript(PluginCall call) {
        final String filename = sanitizeFilename(call.getString("filename"));
        final String content = call.getString("content", "");
        if (filename.isEmpty()) {
            call.reject("A filename is required");
            return;
        }
        if (content.isEmpty()) {
            call.reject("The transcript is empty");
            return;
        }
        final byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        if (bytes.length > MAX_CONTENT_BYTES) {
            call.reject("The transcript is too large to save");
            return;
        }
        // Storage writes stay off the main thread; PluginCall is safe to
        // resolve from the bridge's task thread.
        getBridge().execute(
            () -> {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        try {
                            Uri uri = saveViaMediaStore(filename, bytes);
                            resolveWithLocation(call, uri, LOCATION_DOWNLOADS);
                            return;
                        } catch (Exception mediaStoreError) {
                            // The write must still succeed on a device
                            // whose Downloads provider misbehaves, so
                            // the app-owned directory below is the
                            // second chance; the web layer reports that
                            // location honestly.
                            Log.w(
                                LOG_TAG,
                                "MediaStore save failed, falling back to app files: "
                                    + mediaStoreError
                            );
                        }
                    }
                    Uri uri = saveToAppDownloads(filename, bytes);
                    resolveWithLocation(call, uri, LOCATION_APP_FILES);
                } catch (Exception e) {
                    // A broad catch on purpose: any unexpected exception
                    // (a broken resolver, a missing volume) must reject
                    // the call instead of escaping the task thread,
                    // where it would crash the app and leave the web
                    // promise hanging forever.
                    Log.e(LOG_TAG, "Transcript save failed", e);
                    call.reject("Could not save the transcript: " + e.getMessage(), e);
                }
            }
        );
    }

    /** Resolves the call with the file's uri and its location. */
    private void resolveWithLocation(PluginCall call, Uri uri, String location) {
        JSObject result = new JSObject();
        result.put("uri", uri.toString());
        result.put("location", location);
        call.resolve(result);
    }

    /**
     * Writes the file into the shared Downloads collection. MediaStore
     * appends a suffix automatically when the name is already taken, so
     * repeated exports never overwrite each other.
     */
    private Uri saveViaMediaStore(String filename, byte[] bytes) throws IOException {
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
        values.put(MediaStore.MediaColumns.MIME_TYPE, TRANSCRIPT_MIME_TYPE);
        values.put(
            MediaStore.MediaColumns.RELATIVE_PATH,
            Environment.DIRECTORY_DOWNLOADS
        );
        values.put(MediaStore.MediaColumns.IS_PENDING, 1);
        Uri uri = getContext()
            .getContentResolver()
            .insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IOException("MediaStore rejected the download entry");
        }
        try {
            writeBytes(uri, bytes);
        } catch (IOException e) {
            // Never leave a pending row behind: it would show up as an
            // empty file in the Downloads folder.
            getContext().getContentResolver().delete(uri, null, null);
            throw e;
        }
        values.clear();
        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
        getContext().getContentResolver().update(uri, values, null, null);
        return uri;
    }

    /**
     * Writes the file into the app's external Downloads directory, with
     * the internal files directory as the last resort. Used on Android
     * 9 and older (where the shared folder would need the legacy
     * storage permission), and on Android 10 and newer whenever the
     * MediaStore write above fails. Needs no permission either way.
     */
    private Uri saveToAppDownloads(String filename, byte[] bytes) throws IOException {
        File directory = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (directory == null) {
            directory = getContext().getFilesDir();
        }
        File target = new File(directory, filename);
        try (FileOutputStream out = new FileOutputStream(target)) {
            out.write(bytes);
        }
        return Uri.fromFile(target);
    }

    /** Streams the payload into a content Uri. */
    private void writeBytes(Uri uri, byte[] bytes) throws IOException {
        try (
            OutputStream out = getContext().getContentResolver().openOutputStream(uri)
        ) {
            if (out == null) {
                throw new IOException("The download entry could not be opened");
            }
            out.write(bytes);
        }
    }

    /**
     * Reduces a web-supplied filename to a plain basename: strips any
     * directory component and characters that are unsafe or reserved on
     * Android filesystems, and caps the length.
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return DEFAULT_FILENAME;
        }
        String basename = filename.substring(filename.lastIndexOf('/') + 1);
        basename = basename.replaceAll("[\\\\:*?\"<>|]", "_").trim();
        if (basename.isEmpty()) {
            return DEFAULT_FILENAME;
        }
        if (basename.length() > MAX_FILENAME_LENGTH) {
            basename = basename.substring(basename.length() - MAX_FILENAME_LENGTH);
        }
        return basename;
    }
}
