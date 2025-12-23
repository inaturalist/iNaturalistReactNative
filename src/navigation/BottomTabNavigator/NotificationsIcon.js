// @flow
import classnames from "classnames";
import { INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { isDebugMode } from "sharedHooks/useDebugMode";
import colors from "styles/tailwindColors";

type Props = {
    unread: boolean,
    icon: string,
    testID: string,
    active:boolean,
    size: number,
    width?: number,
    height?: number
};

const NotificationsIcon = ( {
  unread,
  testID,
  size,
  icon,
  active,
  width,
  height,
}: Props ): React.Node => {
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    testID,
    width,
    height,
  };

  const isDebug = isDebugMode( );

  if ( unread ) {
    return (
      <View
        className="flex items-center justify-center"
        {...sharedProps}
      >
        <INatIcon
          name={icon}
          color={active
            ? colors.inatGreen
            : colors.darkGray}
          size={size}
          isDarkModeEnabled={isDebug}
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
            "items-center",
          )}
        >
          <View
            className={classnames(
              active
                ? "bg-warningRed"
                : "bg-inatGreen",
              "h-[9px]",
              "rounded-full",
              "w-[9px]",
            )}
          />
        </View>
      </View>
    );
  }

  return (
    <INatIconButton
      icon={icon}
      isDarkModeEnabled={isDebug}
      color={active
        ? colors.inatGreen
        : colors.darkGray}
      size={size}
      {...sharedProps}
      iconOnly
    />
  );
};

export default NotificationsIcon;
