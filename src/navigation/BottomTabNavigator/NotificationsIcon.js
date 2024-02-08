// @flow
import { INatIcon, INatIconButton } from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import * as React from "react";
import colors from "styles/tailwindColors";

type Props = {
    unread: boolean,
    icon: string,
    testID: string,
    onPress: any,
    active:boolean,
    accessibilityLabel: string,
    accessibilityRole?: string,
    accessibilityHint?: string,
    size: number,
    width?: number,
    height?: number
};

const NotificationsIcon = ( {
  unread,
  testID,
  size,
  icon,
  onPress,
  active,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "tab",
  width,
  height
}: Props ): React.Node => {
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    testID,
    onPress,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState: {
      selected: active,
      expanded: active,
      disabled: false
    },
    width,
    height
  };

  if ( unread ) {
    return (
      <Pressable
        className="flex items-center justify-center"
        {...sharedProps}
      >
        <INatIcon
          name={icon}
          color={active
            ? colors.inatGreen
            : colors.darkGray}
          size={size}

        />
        <View className="bg-warningRed h-[10px] w-[10px] rounded-full absolute top-1 right-2.5" />

      </Pressable>
    );
  }

  return (
    <INatIconButton
      icon={icon}
      color={active
        ? colors.inatGreen
        : colors.darkGray}
      size={size}
      {...sharedProps}
    />
  );
};

export default NotificationsIcon;
