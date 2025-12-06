package com.qhitz.mui;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge display for better foldable device support
        getWindow().setDecorFitsSystemWindows(false);

        // Handle status bar appearance
        View decorView = getWindow().getDecorView();
        int flags = decorView.getSystemUiVisibility();

        // Keep layout stable during fold/unfold transitions
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    }
}
