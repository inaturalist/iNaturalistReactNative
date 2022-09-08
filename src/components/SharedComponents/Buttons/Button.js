// @flow

import * as React from "react";
import { Button as ButtonRNP, useTheme } from "react-native-paper";

import TranslatedText from "../TranslatedText";

type ButtonProps = {
  text: string,
  disabled?: boolean,
  onPress: any,
  level?: string,
  count?: number,
  testID?: string,
  loading?: boolean,
  style?: any,
}

const setStyles = ( {
  level,
  disabled,
  theme
} ) => {
  const buttonContainer = [theme.button.buttonDefault];
  const buttonText = [theme.text.buttonTextDefault];

  if ( level === "warning" ) {
    buttonContainer.push( theme.button.buttonWarning );
  } else if ( level === "primary" ) {
    buttonContainer.push( theme.button.buttonPrimary );
  } else {
    buttonContainer.push( theme.button.buttonNeutral );
  }

  if ( disabled ) {
    if ( level === "warning" ) {
      buttonContainer.push( theme.button.buttonWarningDisabled );
    } else if ( level === "primary" ) {
      buttonContainer.push( theme.button.buttonPrimaryDisabled );
    } else {
      buttonContainer.push( theme.button.buttonNeutralDisabled );
    }
  }

  return { buttonText, buttonContainer };
};

const Button = ( {
  text, onPress, disabled, testID, count, level, loading, style
}: ButtonProps ): React.Node => {
  const theme = useTheme( );
  const { buttonText, buttonContainer } = setStyles( { disabled, level, theme } );

  return (
    <ButtonRNP
      onPress={onPress}
      contentStyle={buttonContainer}
      style={style}
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
