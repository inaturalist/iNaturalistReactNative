import {
  Body2, INatIcon
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
  text
}: Props ) => (
  <Pressable
    accessibilityRole="button"
    className="flex-row"
    onPress={handlePress}
    accessibilityLabel={accessibilityLabel}
  >
    <View className="flex-row ml-1 py-[10px] items-center">
      <View className="w-[30px] items-center mr-1">
        <INatIcon
          size={14}
          name={iconName}
        />
      </View>
      <Body2 className="mr-[13px]">
        {text}
      </Body2>
    </View>
    <View className="mt-4">
      <INatIcon
        name="triangle-down"
        size={24}
      />
    </View>
  </Pressable>
);

export default DropdownItem;
