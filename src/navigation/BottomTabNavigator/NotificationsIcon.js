// @flow
import classnames from "classnames";
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
    onPress: Function,
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
        <View
          className={classnames(
            "absolute",
            "bg-white",
            "h-[15px]",
            "right-1.5",
            "rounded-full",
            "top-1",
            "w-[15px]",
            "justify-center",
            "items-center"
          )}
        >
          <View
            className={classnames(
              active
                ? "bg-warningRed"
                : "bg-inatGreen",
              "h-[9px]",
              "rounded-full",
              "w-[9px]"
            )}
          />
        </View>
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
