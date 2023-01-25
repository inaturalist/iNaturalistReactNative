// @flow

import { Text } from "components/styledComponents";
import * as React from "react";
import { Button as ButtonRNP } from "react-native-paper";

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
  let buttonClass = "rounded";
  let textClass = "text-lg text-white font-semibold";

  if ( className ) {
    buttonClass += ` ${className}`;
  }

  if ( level === "warning" ) {
    buttonClass += buttonClass.concat( " ", "bg-warningRed" );
  } else if ( level === "primary" ) {
    buttonClass += buttonClass.concat( " ", "bg-darkGray" );
  } else if ( level === "focus" ) {
    buttonClass += buttonClass.concat( " ", "bg-accessibleGreen" );
  } else {
    buttonClass += buttonClass.concat( " ", "border border-darkGray border-[2.6px]" );
    textClass += textClass.concat( " ", "color-darkGray" );
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

  return { buttonClass, textClass };
};

const Button = ( {
  text, onPress, disabled, testID, level, loading, style, className
}: ButtonProps ): React.Node => {
  const { buttonClass, textClass } = setStyles( { disabled, level, className } );

  return (
    <ButtonRNP
      onPress={onPress}
      className={buttonClass}
      style={style}
      disabled={disabled}
      testID={testID}
      loading={loading}
    >
      <Text className={textClass}>
        {text}
      </Text>
    </ButtonRNP>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
