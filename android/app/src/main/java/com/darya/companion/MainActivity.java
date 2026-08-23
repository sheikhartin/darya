package com.darya.companion;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    /**
     * Retires the web app's service worker and shell caches inside the
     * shell, at the start of every page load.
     *
     * The APK bundles the whole app, so a service worker adds nothing
     * here, but builds up to 1.9.1 registered one: after an app update
     * that leftover worker kept serving the previous app shell from
     * Cache Storage, so the app appeared stuck on the old UI until its
     * data was cleared. The updated web layer (js/app/native.js) never
     * registers the worker and retires leftovers itself, but a device
     * upgrading from an affected build first loads through the old
     * worker's cached shell, where that code cannot run. This injected
     * snippet breaks the loop from the native side: it unregisters the
     * worker and deletes the app-owned caches (name prefixes must match
     * sw.js), so the next load is served from this APK's assets. It is
     * idempotent and a no-op once the shell is clean.
     */
    private static final String RETIRE_WEB_CACHES_SCRIPT =
        "(function(){" +
        "try{" +
        "if(navigator.serviceWorker){" +
        "navigator.serviceWorker.getRegistrations().then(function(rs){" +
        "rs.forEach(function(r){r.unregister();});});}" +
        "if(window.caches){" +
        "caches.keys().then(function(ks){" +
        "ks.forEach(function(k){" +
        "if(k.indexOf('darya-cache-')===0||k.indexOf('darya-static-')===0){" +
        "caches.delete(k);}});});}" +
        "}catch(e){}" +
        "})();";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ExportPlugin.class);
        super.onCreate(savedInstanceState);
        this.bridge.addWebViewListener(
                new WebViewListener() {
                    @Override
                    public void onPageStarted(WebView view) {
                        view.evaluateJavascript(RETIRE_WEB_CACHES_SCRIPT, null);
                    }
                }
            );
    }
}
