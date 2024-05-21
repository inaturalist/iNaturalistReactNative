import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

const KeyboardDismissibleView = ( { children } ) => (
  <TouchableWithoutFeedback
    accessibilityRole="button"
    onPress={Keyboard.dismiss}
  >
    {children}
  </TouchableWithoutFeedback>
);

export default KeyboardDismissibleView;
