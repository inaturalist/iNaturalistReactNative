package com.inaturalistreactnative;

import com.facebook.react.ReactActivity;
import android.os.Bundle;

public class MainActivity extends ReactActivity {
  /**
   * Needed for react-native-screens / react-navigation
   * https://reactnavigation.org/docs/getting-started/
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "iNaturalistReactNative";
  }
}
