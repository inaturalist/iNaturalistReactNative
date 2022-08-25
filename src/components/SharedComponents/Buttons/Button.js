// @flow

import * as React from "react";
import { TouchableOpacity } from "react-native";

import { textStyles, viewStyles } from "../../../styles/sharedComponents/buttons/buttonVariants";
import TranslatedText from "../TranslatedText";

type ButtonProps = {
  text: string,
  disabled?: boolean,
  onPress: any,
  level?: string,
  count?: number,
  testID?: string,

}
const setStyles = ( {
  level,
  disabled
} ) => {
  const buttonContainer = [viewStyles.containerDefault];
  const buttonText = [textStyles.textDefault];

  if ( level === "warning" ) {
    buttonContainer.push( viewStyles.containerWarning );
  } else if ( level === "primary" ) {
    buttonContainer.push( viewStyles.containerPrimary );
  } else {
    buttonContainer.push( viewStyles.containerNeutral );
  }

  if ( disabled ) {
    buttonContainer.push( viewStyles.containerDisabled );
  }

  return { buttonText, buttonContainer };
};

const Button = ( {
  text, onPress, disabled, testID, count, level
}: ButtonProps ): React.Node => {
  const { buttonText, buttonContainer } = setStyles( { disabled, level } );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonContainer}
      disabled={disabled}
      testID={testID}
    >
      <TranslatedText
        count={count}
        style={buttonText}
        text={text}
      />
    </TouchableOpacity>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
