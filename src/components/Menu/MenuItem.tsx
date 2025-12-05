import classNames from "classnames";
import { Heading4, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";

import type { MenuOption } from "./Menu";

const MenuItem = ( {
  item,
  onPress
}: {
  item: MenuOption;
  onPress: ( ) => void;
} ) => (
  <Pressable
    className={classNames(
      item.isLogout
        ? "opacity-50"
        : "",
      "flex-row items-center pl-10 py-5 border-b border-lightGray"
    )}
    accessibilityRole="button"
    accessibilityLabel={item.label}
    onPress={onPress}
  >
    <View className="mr-5">
      <INatIcon name={item.icon} size={22} color={item.color} />
    </View>
    <Heading4>{item.label}</Heading4>
  </Pressable>
);

export default MenuItem;
