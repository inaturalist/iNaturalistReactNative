package org.inaturalist.iNaturalistMobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.widget.EditText

class MainActivity : ReactActivity() {
  /**
   * Needed for react-native-screens / react-navigation
   * https://reactnavigation.org/docs/getting-started/
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    // Fabric views attached after layout keep isLaidOut()=false, so Android postpones
    // autofill's focus event until the field lays out again (i.e. until typing).
    window.decorView.viewTreeObserver.addOnGlobalFocusChangeListener { _, newFocus ->
      if (newFocus is EditText && !newFocus.isLaidOut) {
        newFocus.layout(newFocus.left, newFocus.top, newFocus.right, newFocus.bottom)
      }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "iNaturalistReactNative"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
