// @flow

import Heading4 from "components/SharedComponents/Typography/Heading4";
import { Pressable } from "components/styledComponents";
import * as React from "react";
import { ActivityIndicator, useTheme } from "react-native-paper";

type ButtonProps = {
  text: string,
  disabled?: boolean,
  onPress: any,
  level?: string,
  testID?: string,
  loading?: boolean,
  style?: any,
  className?: string,
  accessibilityRole?: string,
  accessibilityHint?: string
}

const setStyles = ( {
  isPrimary,
  isFocus,
  isWarning,
  disabled,
  className
} ) => {
  let buttonClass = "rounded-lg flex-row justify-center items-center py-[13px] px-[10px]";
  let textClass = "text-white";

  if ( className ) {
    buttonClass = buttonClass.concat( " ", className );
  }

  if ( isWarning ) {
    buttonClass = buttonClass.concat( " ", "bg-warningRed" );
  } else if ( isPrimary ) {
    buttonClass = buttonClass.concat( " ", "bg-darkGray" );
  } else if ( isFocus ) {
    buttonClass = buttonClass.concat( " ", "bg-inatGreen" );
  } else {
    buttonClass = buttonClass.concat(
      " ",
      "border border-darkGray border-[3px]"
    );
    textClass = textClass.concat( " ", "text-darkGray" );
  }

  if ( disabled ) {
    buttonClass = buttonClass.concat( " ", "opacity-[0.5]" );
  }

  return { buttonClass, textClass };
};

const activityIndicatorColor = ( {
  isPrimary, isWarning, isFocus, theme
} ) => {
  if ( isPrimary ) {
    return theme.colors.onPrimary;
  }
  if ( isFocus ) {
    return theme.colors.onSecondary;
  }
  if ( isWarning ) {
    return theme.colors.onError;
  }
  // Default color of ActivityIndicator is primary anyways, but we need to return something
  return theme.colors.primary;
};

const Button = ( {
  text,
  onPress,
  disabled,
  testID,
  level,
  loading,
  style,
  className,
  accessibilityRole,
  accessibilityHint
}: ButtonProps ): React.Node => {
  const isPrimary = level === "primary";
  const isWarning = level === "warning";
  const isFocus = level === "focus";
  const isNeutral = !isPrimary && !isWarning && !isFocus;
  const { buttonClass, textClass } = setStyles( {
    disabled,
    isPrimary,
    isFocus,
    isWarning,
    className
  } );

  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={buttonClass}
      style={style}
      disabled={disabled}
      testID={testID}
      // has no accessibilityLabel prop because then the button text is read as label
      accessibilityRole={accessibilityRole || "button"}
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
    >
      {loading && (
        <ActivityIndicator
          size={18}
          className="mr-2"
          color={!isNeutral && activityIndicatorColor( {
            isPrimary, isWarning, isFocus, theme
          } )}
        />
      )}
      <Heading4 className={textClass}>{text}</Heading4>
    </Pressable>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
