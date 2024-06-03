import { View } from "components/styledComponents";
import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

const KeyboardDismissibleView = ( { children } ) => (
  <TouchableWithoutFeedback accessibilityRole="button" onPress={Keyboard.dismiss}>
    <View className="flex-1">
      {children}
    </View>
  </TouchableWithoutFeedback>
);

export default KeyboardDismissibleView;
