import { Platform } from "react-native";

// react-navigation does not implement a true full screen modal for Android, so
// this is a hack that uses a screen in the root drawer navigator to do login
// for Android, which will be full screen over the tab bar, but won't have a
// proper modal transition or navigation behavior (e.g. won't maintain
// position in another stack navigator)
// eslint-disable-next-line import/prefer-default-export
export function navigateToLogin( navigation, options = { } ) {
  navigation.navigate(
    Platform.OS === "ios"
      ? "ModalLoginScreen"
      : "LoginNavigatorAndroid",
    options
  );
}
