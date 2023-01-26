// @flow

import { Pressable, Text } from "components/styledComponents";
import * as React from "react";
import { ActivityIndicator } from "react-native-paper";

type ButtonProps = {
  text: string,
  disabled?: boolean,
  onPress: any,
  level?: string,
  testID?: string,
  loading?: boolean,
  style?: any,
  className?: string
}

const setStyles = ( {
  level,
  disabled,
  className
} ) => {
  let buttonClass = "rounded flex-row justify-center p-1";
  let textClass = "text-lg text-white font-semibold";

  if ( className ) {
    buttonClass = buttonClass.concat( " ", className );
  }

  if ( level === "warning" ) {
    buttonClass = buttonClass.concat( " ", "bg-warningRed" );
  } else if ( level === "primary" ) {
    buttonClass = buttonClass.concat( " ", "bg-darkGray" );
  } else if ( level === "focus" ) {
    buttonClass = buttonClass.concat( " ", "bg-inatGreen" );
  } else {
    buttonClass = buttonClass.concat( " ", "border border-darkGray border-[2.6px]" );
    textClass = textClass.concat( " ", "color-darkGray" );
  }

  if ( disabled ) {
    if ( level === "warning" ) {
      buttonClass = buttonClass.concat( " ", "bg-buttonWarningDisabled" );
    } else if ( level === "primary" ) {
      buttonClass = buttonClass.concat( " ", "bg-buttonPrimaryDisabled" );
    } else {
      buttonClass = buttonClass.concat( " ", "bg-buttonNeutralDisabled" );
    }
  }

  return { buttonClass, textClass };
};

const Button = ( {
  text, onPress, disabled, testID, level, loading, style, className
}: ButtonProps ): React.Node => {
  const { buttonClass, textClass } = setStyles( { disabled, level, className } );

  return (
    <Pressable
      onPress={onPress}
      className={buttonClass}
      style={style}
      disabled={disabled}
      testID={testID}
    >
      {loading && <ActivityIndicator size={18} className="mr-2" />}
      <Text className={textClass}>
        {text}
      </Text>
    </Pressable>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
