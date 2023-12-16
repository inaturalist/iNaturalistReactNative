// @flow

import classnames from "classnames";
import { Heading4, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import * as React from "react";
import { ActivityIndicator, useTheme } from "react-native-paper";

type ButtonProps = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  accessibilityRole?: string,
  className?: string,
  disabled?: boolean,
  forceDark?: boolean,
  icon?: any,
  level?: string,
  loading?: boolean,
  onPress: any,
  style?: any,
  testID?: string,
  text: string,
  dropdown?: boolean,
  ignoreDark?: boolean
}

const setStyles = ( {
  className,
  disabled,
  forceDark,
  isFocus,
  isPrimary,
  isWarning,
  ignoreDark
} ) => {
  const buttonClasses = [
    "active:opacity-75",
    "flex-row",
    "items-center",
    "justify-center",
    "px-[10px]",
    "py-[13px]",
    "rounded-lg",
    "font-Whitney-Bold"
  ];
  const textClasses = [
    "text-center",
    disabled
      ? "text-white/50"
      : "text-white"
  ];

  if ( className ) {
    buttonClasses.push( className );
  }

  if ( isWarning ) {
    buttonClasses.push( disabled
      ? "bg-warningRedDisabled"
      : "bg-warningRed" );
  } else if ( isPrimary ) {
    buttonClasses.push( disabled
      ? "bg-darkGrayDisabled"
      : "bg-darkGray" );
    textClasses.push( disabled
      ? "text-white/50"
      : "text-white" );
  } else if ( isFocus ) {
    if ( forceDark ) {
      buttonClasses.push( disabled
        ? "bg-inatGreenDisabledDark"
        : "bg-inatGreen" );
    } else {
      buttonClasses.push( disabled
        ? "bg-inatGreenDisabled"
        : "bg-inatGreen" );
    }
  } else {
    buttonClasses.push( "border border-[3px]" );
    if ( ignoreDark ) {
      buttonClasses.push( "border-darkGray" );
      textClasses.push( "text-darkGray" );
    } else {
      buttonClasses.push( disabled
        ? "border-darkGrayDisabled"
        : "border-darkGray bg-white" );
      textClasses.push( disabled
        ? "text-darkGrayDisabled"
        : "text-darkGray" );
    }
  }

  return { buttonClasses, textClasses };
};

const setDarkStyles = ( {
  buttonClasses,
  textClasses,
  isPrimary,
  isFocus,
  disabled,
  forceDark
} ) => {
  if ( isPrimary ) {
    buttonClasses.push(
      disabled
        ? ""
        : "dark:bg-white"
    );
    textClasses.push(
      disabled
        ? "dark:text-darkGray/50"
        : "dark:text-darkGray"
    );
  } else if ( isFocus ) {
    if ( !forceDark ) {
      buttonClasses.push(
        disabled
          ? "dark:bg-inatGreenDisabledDark"
          : ""
      );
    }
  }
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
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  className,
  disabled,
  forceDark,
  icon,
  level,
  loading,
  onPress,
  style,
  testID,
  text,
  dropdown,
  ignoreDark
}: ButtonProps ): React.Node => {
  const isPrimary = level === "primary";
  const isWarning = level === "warning";
  const isFocus = level === "focus";
  const isNeutral = !isPrimary && !isWarning && !isFocus;
  const { buttonClasses, textClasses } = setStyles( {
    className,
    disabled,
    forceDark,
    isFocus,
    isPrimary,
    isWarning,
    ignoreDark
  } );
  // Dark mode styles can be set with this function, but si scheduled to be worked on post-MVP
  setDarkStyles( {
    buttonClasses,
    textClasses,
    isWarning,
    isPrimary,
    isFocus,
    disabled,
    forceDark
  } );

  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={classnames( buttonClasses )}
      style={style}
      disabled={disabled}
      testID={testID}
      // has no accessibilityLabel prop because then the button text is read as label
      accessibilityRole={accessibilityRole || "button"}
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
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
      {icon && (
        <View className="mr-2">
          {icon}
        </View>
      )}
      <Heading4
        className={classnames( textClasses )}
        testID={`${testID || "RNButton"}.text`}
      >
        {text}
      </Heading4>
      {dropdown && (
        <View className="ml-2 mb-1">
          <INatIcon
            name="caret"
            size={10}
          />
        </View>
      )}
    </Pressable>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
