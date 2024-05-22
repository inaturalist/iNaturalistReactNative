import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { useTranslation } from "sharedHooks";

const KeyboardDismissibleView = ( { children } ) => {
  const { t } = useTranslation( );
  return (
    <TouchableWithoutFeedback
      accessibilityLabel={t( "Tap-outside-text-input-to-dismiss-keyboard" )}
      accessibilityRole="button"
      onPress={Keyboard.dismiss}
    >
      {children}
    </TouchableWithoutFeedback>
  );
};

export default KeyboardDismissibleView;
