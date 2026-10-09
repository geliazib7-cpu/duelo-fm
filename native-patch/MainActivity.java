package com.ygoduelo.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

/**
 * Arreglo para un bug conocido de ciertos telefonos (Xiaomi/MIUI, Honor,
 * algunos Poco) donde el WebView se queda en pantalla negra/en blanco al
 * abrir la app hasta que se toca la pantalla. Forzar el WebView a modo de
 * renderizado por software evita que se quede "congelado" sin dibujar el
 * primer cuadro.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
    }
}
