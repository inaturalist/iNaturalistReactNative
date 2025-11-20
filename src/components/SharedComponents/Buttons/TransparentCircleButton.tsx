import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import colors from "styles/tailwindColors";

export const CIRCLE_OPTIONS_CLASSES = [
  "bg-black/50",
  "items-center",
  "justify-center",
  "rounded-full"
].join( " " );

export const CIRCLE_SIZE = "h-[40px] w-[40px]";

interface Props {
  onPress: ( _event: GestureResponderEvent ) => void;
  optionalClasses?: string;
  accessibilityHint?: string;
  accessibilityLabel: string;
  icon: string;
  testID?: string;
}

const TransparentCircleButton = ( {
  onPress,
  optionalClasses,
  accessibilityLabel,
  accessibilityHint,
  icon,
  testID
}: Props ) => (
  <INatIconButton
    className={classnames( CIRCLE_OPTIONS_CLASSES, optionalClasses, CIRCLE_SIZE )}
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    icon={icon}
    color={colors.white}
    size={20}
    testID={testID}
  />
);

export default TransparentCircleButton;
