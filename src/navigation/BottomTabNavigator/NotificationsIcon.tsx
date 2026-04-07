import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import colors from "styles/tailwindColors";

interface Props {
    unread: boolean;
    icon: string;
    active: boolean;
    size: number;
}

const NotificationsIcon = ( {
  unread,
  size,
  icon,
  active,
}: Props ) => (
  <View className="relative">
    <INatIcon
      name={icon}
      color={active
        ? colors.inatGreen
        : colors.darkGray}
      size={size}
    />
    { unread && (
      <View
        className={classnames(
          "absolute",
          "bg-white",
          "h-[13px]",
          "right-[-2px]",
          "rounded-full",
          "top-0",
          "w-[13px]",
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
    ) }
  </View>
);

export default NotificationsIcon;
