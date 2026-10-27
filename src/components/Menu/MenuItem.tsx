import classNames from "classnames";
import { Heading4, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import colors from "styles/tailwindColors";

import type { MenuOption } from "./Menu";

const MenuItem = ( {
  item,
  onPress,
}: {
  item: MenuOption;
  onPress: ( ) => void;
} ) => (
  <Pressable
    testID={item.testID}
    className={classNames(
      item.isLogout
        ? "opacity-50"
        : "",
      "flex-row items-center pl-10 py-[22px] border-b border-lightGray",
    )}
    accessibilityRole="button"
    accessibilityLabel={item.label}
    onPress={onPress}
  >
    <View className="mr-5">
      {typeof item.icon === "string"
        ? <INatIcon name={item.icon} size={22} color={item.color} />
        : <item.icon width={22} height={22} color={item.color || colors.darkGray} />}
    </View>
    <Heading4>{item.label}</Heading4>
  </Pressable>
);

export default MenuItem;
