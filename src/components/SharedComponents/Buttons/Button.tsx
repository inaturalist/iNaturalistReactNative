import { tailwindFontBold } from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import { ActivityIndicator, Heading4, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import * as React from "react";
import { AccessibilityRole, GestureResponderEvent, ViewStyle } from "react-native";
import { MD3Theme, useTheme } from "react-native-paper";

interface ButtonProps {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  style?: ViewStyle;
  className?: string;
  disabled?: boolean;
  forceDark?: boolean;
  icon?: string;
  iconPosition?: string,
  level?: string;
  loading?: boolean;
  onPress: ( _event?: GestureResponderEvent ) => void;
  testID?: string;
  text: string;
  dropdown?: boolean;
}

const setStyles = ( {
  className,
  disabled,
  forceDark,
  isFocus,
  isPrimary,
  isWarning
}: {
  className?: string;
  disabled?: boolean;
  forceDark?: boolean;
  isFocus: boolean;
  isPrimary: boolean;
  isWarning: boolean;
} ) => {
  const buttonClasses = [
    "active:opacity-75",
    "flex-row",
    "items-center",
    "justify-center",
    "px-[10px]",
    "py-[13px]",
    "rounded-lg",
    tailwindFontBold
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
    buttonClasses.push( disabled
      ? "border-darkGrayDisabled"
      : "border-darkGray bg-white" );
    textClasses.push( disabled
      ? "text-darkGrayDisabled"
      : "text-darkGray" );
  }

  return { buttonClasses, textClasses };
};

// Dark mode styles can be set with this function, but si scheduled to be worked on post-MVP
// const setDarkStyles = ( {
//   buttonClasses,
//   textClasses,
//   isPrimary,
//   isFocus,
//   disabled,
//   forceDark
// } ) => {
//   if ( isPrimary ) {
//     buttonClasses.push(
//       disabled
//         ? ""
//         : "dark:bg-white"
//     );
//     textClasses.push(
//       disabled
//         ? "dark:text-darkGray/50"
//         : "dark:text-darkGray"
//     );
//   } else if ( isFocus ) {
//     if ( !forceDark ) {
//       buttonClasses.push(
//         disabled
//           ? "dark:bg-inatGreenDisabledDark"
//           : ""
//       );
//     }
//   }
// };

const activityIndicatorColor = ( {
  isPrimary, isWarning, isFocus, theme
}: {
  isPrimary: boolean;
  isWarning: boolean;
  isFocus: boolean;
  theme: MD3Theme;
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
  style,
  className,
  disabled,
  forceDark,
  icon,
  iconPosition = "left",
  level,
  loading,
  onPress,
  testID,
  text,
  dropdown
}: ButtonProps ) => {
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
    isWarning
  } );
  // Dark mode styles can be set with this function, but is scheduled to be worked on post-MVP
  // setDarkStyles( {
  //   buttonClasses,
  //   textClasses,
  //   isWarning,
  //   isPrimary,
  //   isFocus,
  //   disabled,
  //   forceDark
  // } );

  const theme = useTheme();

  return (
    <Pressable
      style={style}
      onPress={onPress}
      className={classnames( buttonClasses )}
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
          color={!isNeutral
            ? activityIndicatorColor( {
              isPrimary, isWarning, isFocus, theme
            } )
            : undefined}
        />
      )}
      {( icon && iconPosition === "left" ) && (
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
      {( icon && iconPosition === "right" ) && (
        <View className="ml-4">
          {icon}
        </View>
      )}
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
