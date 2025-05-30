package com.mangayouknow.dev

import android.webkit.WebView
import android.annotation.SuppressLint

import android.os.Bundle
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat


class MainActivity : TauriActivity() {
  private lateinit var wv: WebView
  
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // WindowCompat.setDecorFitsSystemWindows(window, false)
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    // windowInsetsController.apply {
    //   hide(WindowInsetsCompat.Type.systemBars())
    //   systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    // }
    window.statusBarColor = android.graphics.Color.parseColor("#ff9697")
    // window.statusBarColor = android.graphics.Color.TRANSPARENT
    // window.navigationBarColor = android.graphics.Color.TRANSPARENT
    // if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
    //   window.attributes.layoutInDisplayCutoutMode = 
    //     android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
    // }
  }

  override fun onWebViewCreate(webView: WebView) {
    wv = webView
  }
  
  @SuppressLint("MissingSuperCall", "SetTextI18n")
  @Deprecated("")
  override fun onBackPressed() {
    wv.evaluateJavascript(/* script = */ """
      try {
        window.androidBackCallback()
      } catch (_) {
        true
      }
    """.trimIndent()) { result ->
      if (result == "true") {
        super.onBackPressed();
      }
    }
  }
}