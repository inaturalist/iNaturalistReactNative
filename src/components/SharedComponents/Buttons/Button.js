// @flow

import * as React from "react";
import { Button as ButtonRNP } from "react-native-paper";

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
  disabled
} ) => {
  let buttonClass = "rounded-3xl h-13";
  const buttonText = "text-lg text-white font-semibold";

  if ( level === "warning" ) {
    buttonClass += buttonClass.concat( " ", "bg-buttonWarning" );
  } else if ( level === "primary" ) {
    buttonClass += buttonClass.concat( " ", "bg-buttonPrimary" );
  } else {
    buttonClass += buttonClass.concat( " ", "bg-buttonNeutral" );
  }

  if ( disabled ) {
    if ( level === "warning" ) {
      buttonClass += buttonClass.concat( " ", "bg-buttonWarningDisabled" );
    } else if ( level === "primary" ) {
      buttonClass += buttonClass.concat( " ", "bg-buttonPrimaryDisabled" );
    } else {
      buttonClass += buttonClass.concat( " ", "bg-buttonNeutralDisabled" );
    }
  }

  return { buttonText, buttonClass };
};

const Button = ( {
  text, onPress, disabled, testID, count, level, loading, style
}: ButtonProps ): React.Node => {
  const { buttonText, buttonClass } = setStyles( { disabled, level } );

  return (
    <ButtonRNP
      onPress={onPress}
      className={buttonClass}
      style={style}
      disabled={disabled}
      testID={testID}
      loading={loading}
    >
      <TranslatedText
        count={count}
        textStyle={buttonText}
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
