// @flow

import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import colors from "styles/tailwindColors";

type Tab = {
  id: string,
  text: string,
  onPress: ( any ) => void
}

type Props = {
  tabs: Tab[],
  activeId: string,
}

const Tabs = ( { tabs = [], activeId }: Props ): Node => {
  const { t } = useTranslation();

  return (
    <View className="bg-white flex flex-row mb-2">
      {
        tabs.map( ( { id, text, onPress } ) => {
          const title = t( text );
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
                testID={`${title}-tab`}
                accessibilityLabel={text}
                accessibilityRole="tab"
                accessibilityState={{
                  disabled: false,
                  selected: active,
                  checked: false,
                  busy: false,
                  expanded: false
                }}
              >
                <Text
                  className="text-xl self-center py-2"
                  style={{ color: active ? colors.primary : colors.grayText }}
                >
                  {title}
                </Text>
                <View className={borderClass} />
              </TouchableOpacity>
            </View>
          );
        } )
      }
    </View>
  );
};

export default Tabs;
