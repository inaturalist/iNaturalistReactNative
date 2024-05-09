// @flow

import {
  Body3, INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  accessibilityLabel: string,
  handlePress: Function,
  iconName: string,
  text: string
}

const DropdownItem = ( {
  accessibilityLabel,
  handlePress,
  iconName,
  text
}: Props ): Node => {
  const caret = (
    <INatIcon
      name="caret"
      size={10}
    />
  );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row flex-nowrap items-center ml-1 mt-5 items-start"
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
    >
      <View className="mt-[2px]">
        <INatIcon
          size={14}
          name={iconName}

        />
      </View>
      <Body3 className="mx-3">
        {text}
      </Body3>
      <View className="mt-[4px]">
        {caret}
      </View>
    </Pressable>
  );
};

export default DropdownItem;
