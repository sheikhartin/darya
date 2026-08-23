package com.darya.companion;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Hardware back-button bridge between the Android shell and the web
 * layer.
 *
 * Capacitor 8 ships no back handling at all, so without this plugin the
 * back gesture finishes the activity even in the middle of a
 * conversation. The web layer (js/app/backbutton.js through
 * js/app/native.js) subscribes to the backButton event at boot and
 * runs the app's navigation policy: dismiss the topmost surface (menu,
 * dialog overlay, confirmation bar), ask before ending an active
 * conversation, or hand the user back to their home screen.
 *
 * While no listener is registered (the page is still loading, or the
 * web bundle failed to boot), back keeps the platform default for the
 * top screen: leave the app.
 */
@CapacitorPlugin(name = "Shell")
public class ShellPlugin extends Plugin {

    /** Event name of the hardware back notification. */
    private static final String EVENT_BACK_BUTTON = "backButton";

    @Override
    public void load() {
        getActivity()
            .getOnBackPressedDispatcher()
            .addCallback(
                getActivity(),
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        if (!hasListeners(EVENT_BACK_BUTTON)) {
                            // No web policy subscribed yet: apply the
                            // platform default instead of swallowing the
                            // press.
                            getActivity().finish();
                            return;
                        }
                        // Retained until consumed so a press during page
                        // setup is not lost.
                        notifyListeners(EVENT_BACK_BUTTON, new JSObject(), true);
                    }
                }
            );
    }

    /**
     * Leaves the app the way the platform back gesture does on a top
     * screen: finishes the activity and returns the user to their home
     * screen. Called by the web policy when back is pressed on the
     * picker with nothing left to dismiss.
     */
    @PluginMethod
    public void exitApp(PluginCall call) {
        call.resolve();
        getActivity().finish();
    }
}
