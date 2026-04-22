import {
  Body2, INatIcon,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";

interface Props {
  accessibilityLabel: string;
  handlePress: () => void;
  iconName: string;
  text: string;
}

const DropdownItem = ( {
  accessibilityLabel,
  handlePress,
  iconName,
  text,
}: Props ) => (
  <Pressable
    accessibilityRole="button"
    className="flex-row ml-1 items-start flex-1 py-[10px]"
    onPress={handlePress}
    accessibilityLabel={accessibilityLabel}
  >
    <View className="w-[30px] h-[21px] items-center justify-center mx-1">
      <INatIcon
        size={14}
        name={iconName}
      />
    </View>
    <Body2 className="flex-shrink">
      {text}
    </Body2>
    <View className="pt-1.5 ml-[13px] h-[21px]">
      <INatIcon
        name="triangle-down"
        size={24}
      />
    </View>
  </Pressable>
);

export default DropdownItem;
