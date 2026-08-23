/**
 * Darya - conversation exporter.
 * Downloads the current chat as a text file for the user to keep.
 * Classic script version.
 */

(function (global) {
  'use strict';

  var DaryaUI = global.DaryaUI;

  const ui = DaryaUI;

  // ========================================================================
  // Helpers
  // ========================================================================

  /**
   * Formats a date using the active language's locale for human-readable
   * export headers. Falls back to ISO-8601 if the Intl API fails or no
   * language is active (e.g., exported before conversation starts).
   * @param {Date} date - The date to format
   * @returns {string} Locale-formatted date-time string
   */
  function formatLocalizedDateTime(date) {
    var lang = global.DaryaUI ? global.DaryaUI.state.lang : null;
    if (!lang) {
      return date.toISOString();
    }
    try {
      return new Intl.DateTimeFormat(lang.ui.dateLocale, {
        dateStyle: 'full',
        timeStyle: 'short'
      }).format(date);
    } catch (error) {
      // If the locale string is invalid or the Intl API is unavailable,
      // fall back to ISO-8601 format silently.
      return date.toISOString();
    }
  }

  /**
   * Builds the header section used in the plain-text export. Contains
   * the localized date-time at export time.
   * @returns {string} The formatted header line
   */
  function buildExportHeader() {
    return formatLocalizedDateTime(new Date());
  }

  /**
   * Builds a plain-text transcript of the entire conversation.
   * Uses a simple "Label (HH:MM):" prefix for each message with a
   * divider line separating the header from the conversation body.
   * @returns {string} Complete plain-text transcript
   */
  function buildPlainTextTranscript() {
    var lang = ui.state.lang;
    var transcript = ui.state.transcript;
    var header = buildExportHeader();
    var lines = [
      lang.ui.exportTitle,
      '',
      header,
      '',
      lang.ui.exportDivider,
      ''
    ];
    for (var i = 0; i < transcript.length; i += 1) {
      var entry = transcript[i];
      var label =
        entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push(label + ' (' + entry.time + '):');
      lines.push(entry.text);
      lines.push('');
    }
    return lines.join('\n');
  }

  /**
   * Shows a notification toast for the export outcome. The overlay
   * module may not be loaded in minimal test environments; the guard
   * keeps the export flow self-contained.
   * @param {string} severity - 'info' | 'warn' | 'error'
   * @param {string} message - Localized notification text
   */
  function notifyExportOutcome(severity, message) {
    if (
      global.DaryaOverlays &&
      typeof global.DaryaOverlays.showNotification === 'function'
    ) {
      global.DaryaOverlays.showNotification(severity, message);
    }
  }

  /**
   * Copies text to the clipboard as a last-resort export path. Tries
   * the async Clipboard API first and falls back to a hidden textarea
   * with the deprecated execCommand path for environments where the
   * async API is unavailable.
   * @param {string} content - Text to copy
   * @returns {Promise<void>} Rejects when neither path worked.
   */
  function copyTextToClipboard(content) {
    if (
      global.navigator &&
      global.navigator.clipboard &&
      typeof global.navigator.clipboard.writeText === 'function'
    ) {
      return global.navigator.clipboard.writeText(content);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.display = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (e) {
        copied = false;
      }
      document.body.removeChild(textarea);
      if (copied) {
        resolve();
      } else {
        reject(new Error('clipboard copy failed'));
      }
    });
  }

  /**
   * Saves the transcript through the native shell's export plugin (the
   * Android WebView cannot run browser downloads) and reports the
   * outcome with a notification. If the write fails, the transcript is
   * copied to the clipboard so the button never silently does nothing.
   * @param {string} filename - Download filename
   * @param {string} content - Text to save
   */
  function exportViaNativeShell(filename, content) {
    var lang = ui.state.lang;
    DaryaNative.saveTextFile(filename, content)
      .then(function (location) {
        notifyExportOutcome(
          'info',
          location === 'app-files'
            ? lang.ui.exportSavedAppFilesNotice
            : lang.ui.exportSavedNotice
        );
      })
      .catch(function () {
        copyTextToClipboard(content)
          .then(function () {
            notifyExportOutcome('info', lang.ui.exportCopiedNotice);
          })
          .catch(function () {
            notifyExportOutcome('error', lang.ui.exportFailedNotice);
          });
      });
  }

  /**
   * Triggers a file download in the browser by creating a temporary anchor
   * element with a Blob URL. The URL is revoked immediately after the click
   * to free memory.
   *
   * Inside the native Android shell the WebView has no download
   * machinery, so a blob anchor click would be a silent no-op; the
   * native export plugin handles that environment instead.
   *
   * Gracefully handles environments where the Blob API or URL.createObjectURL
   * are unavailable (e.g. very old browsers, some testing environments).
   * @param {string} filename - Download filename (e.g., "darya-chat-en-2025-03-15.md")
   * @param {string} content - Text content to write to the file
   * @param {string} mimeType - MIME type ("text/markdown" or "text/plain")
   */
  function downloadTextFile(filename, content, mimeType) {
    // Native shell: the Android export plugin writes the file to the
    // device storage; the blob path below cannot work there.
    if (
      global.DaryaNative &&
      DaryaNative.isNativeApp &&
      DaryaNative.isNativeApp()
    ) {
      exportViaNativeShell(filename, content);
      return;
    }

    // Guard: Blob API may not be available in all environments
    if (typeof Blob === 'undefined') {
      console.warn('Darya export: Blob API not available, download skipped');
      return;
    }

    // Guard: prevent attempting to download empty content
    if (!content || content.length === 0) {
      return;
    }

    var blob;
    try {
      blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    } catch (e) {
      console.warn('Darya export: could not create Blob (' + e.message + ')');
      return;
    }

    var url;
    try {
      url = URL.createObjectURL(blob);
    } catch (e) {
      console.warn(
        'Darya export: could not create object URL (' + e.message + ')'
      );
      return;
    }

    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    try {
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      // Some environments (e.g. test runners, sandboxed iframes) may
      // reject the DOM manipulation. Swallow silently.
    }

    // Clean up: remove the link and revoke the blob URL immediately,
    // including if the appendChild or click threw.
    try {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    } catch (e) {
      /* ignore cleanup errors */
    }

    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      /* ignore revoke errors */
    }
  }

  /**
   * Returns a compact ISO-8601 timestamp string safe for use in filenames.
   * Replaces colons and 'T' separators with hyphens for cross-platform
   * filename compatibility.
   * @returns {string} e.g., "2025-03-15-14-30"
   */
  function exportTimestamp() {
    return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  }

  /**
   * Exports the conversation transcript as a plain text file.
   * No-op if there is no active language or no transcript content.
   * Triggers a browser file download with a descriptive filename.
   */
  function exportPlainText() {
    if (
      !ui.state.lang ||
      !ui.state.transcript ||
      ui.state.transcript.length === 0
    ) {
      return;
    }
    downloadTextFile(
      'darya-chat-' + ui.state.lang.code + '-' + exportTimestamp() + '.txt',
      buildPlainTextTranscript(),
      'text/plain'
    );
  }

  const DaryaExport = {
    exportPlainText
  };

  global.DaryaExport = DaryaExport;
})(typeof window !== 'undefined' ? window : globalThis);
