// @flow

import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

export const CIRCLE_BUTTON_DIM = 40;

const circleOptionsClasses = [
  "bg-black/50",
  `h-[${CIRCLE_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CIRCLE_BUTTON_DIM}px]`
].join( " " );

type Props = {
  onPress: any,
  optionalClasses?: string,
  accessibilityHint?: string,
  accessibilityLabel: string,
  icon: string,
  testID?: string
}

const TransparentCircleButton = ( {
  onPress,
  optionalClasses,
  accessibilityLabel,
  accessibilityHint,
  icon,
  testID
}: Props ): Node => (
  <INatIconButton
    className={classnames( circleOptionsClasses, optionalClasses )}
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
