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
}: Props ) => {
  const caret = (
    <INatIcon
      name="caret"
      size={10}
    />
  );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row flex-nowrap ml-1 pt-5 pb-2 items-center"
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
    >
      <View className="mt-[2px]">
        <INatIcon
          size={14}
          name={iconName}
        />
      </View>
      <Body2 className="mx-3">
        {text}
      </Body2>
      <View className="mt-[4px]">
        {caret}
      </View>
    </Pressable>
  );
};

export default DropdownItem;
