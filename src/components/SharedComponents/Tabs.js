// @flow

import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { TouchableOpacity } from "react-native";
import colors from "styles/tailwindColors";

type Tab = {
  id: string,
  text: string,
  testID?: string,
  onPress: ( any ) => void
}

type Props = {
  tabs: Tab[],
  activeId: string,
}

const DEFAULT_TABS = [];
const Tabs = ( { tabs = DEFAULT_TABS, activeId }: Props ): Node => (
  <View
    className="bg-white flex flex-row"
    accessibilityRole="tablist"
  >
    {
      tabs.map( ( {
        id, text, onPress, testID
      } ) => {
        const active = activeId === id;
        const borderClass = `${active ? "bg-primary" : "bg-white"} h-1 rounded-t-lg`;
        return (
          <View key={id} className="flex-1">
            <TouchableOpacity
              onPress={( ...args ) => {
                if ( !active ) {
                  onPress( ...args );
                }
              }}
              testID={testID || `${id}-tab`}
              accessibilityLabel={text}
              accessibilityRole="tab"
              accessibilityState={{
                selected: active,
                expanded: active
              }}
            >
              <Text
                className="text-xl self-center py-2"
                style={{ color: active ? colors.primary : colors.grayText }}
              >
                {text}
              </Text>
              <View className={borderClass} />
            </TouchableOpacity>
          </View>
        );
      } )
    }
  </View>
);

export default Tabs;
