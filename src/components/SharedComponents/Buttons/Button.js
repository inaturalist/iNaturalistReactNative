// @flow

import * as React from "react";
import { Button as ButtonRNP } from "react-native-paper";

import { textStyles, viewStyles } from "../../../styles/sharedComponents/buttons/buttonVariants";
import TranslatedText from "../TranslatedText";

type ButtonProps = {
  text: string,
  disabled?: boolean,
  onPress: any,
  level?: string,
  count?: number,
  testID?: string,
  loading?: boolean,

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
    if ( level === "warning" ) {
      buttonContainer.push( viewStyles.containerWarningDisabled );
    } else if ( level === "primary" ) {
      buttonContainer.push( viewStyles.containerPrimaryDisabled );
    } else {
      buttonContainer.push( viewStyles.containerNeutralDisabled );
    }
  }

  return { buttonText, buttonContainer };
};

const Button = ( {
  text, onPress, disabled, testID, count, level, loading
}: ButtonProps ): React.Node => {
  const { buttonText, buttonContainer } = setStyles( { disabled, level } );

  return (
    <ButtonRNP
      onPress={onPress}
      style={buttonContainer}
      disabled={disabled}
      testID={testID}
      loading={loading}
    >
      <TranslatedText
        count={count}
        style={buttonText}
        text={text}
      />
    </ButtonRNP>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
