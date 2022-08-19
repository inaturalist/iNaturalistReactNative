import React from "react";
import { Text, TouchableOpacity } from "react-native";

import { textStyles, viewStyles } from "../../../styles/sharedComponents/buttons/buttonVariants";

const setStyles = ( {
  level,
  disabled
} ) => {
  const buttonContainer = [viewStyles.containerDefault];
  const buttontext = [textStyles.textDefault];

  if ( level === "warning" ) {
    buttonContainer.push( viewStyles.containerWarning );
  } else if ( level === "neutral" ) {
    buttonContainer.push( viewStyles.containerNeutral );
  } else {
    buttonContainer.push( viewStyles.containerPrimary );
  }

  if ( disabled ) {
    buttonContainer.push( viewStyles.containerDisabled );
  }

  return { buttontext, buttonContainer };
};

const Button = ( {
  text, level, onPress, disabled, testID
} ) => {
  const { buttontext, buttonContainer } = setStyles( { disabled, level } );
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonContainer}
      disabled={disabled}
      testID={testID}
    >
      <Text style={buttontext}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
