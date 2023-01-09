// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Button } from "react-native";
import colors from "styles/tailwindColors";

type Tab = {
  id: string,
  text: string,
  onClick: ( ) => void
}

type Props = {
  tabs: Tab[],
  activeId: string,
}

const Tabs = ( { tabs = [], activeId }: Props ): Node => (
  <View className="bg-white flex flex-row">
    {
        tabs.map( ( { id, text, onClick } ) => {
          const active = activeId === id;
          const borderClass = `${active ? "bg-primary" : "bg-white"} h-1 rounded-t-lg`;
          return (
            <View key={id} className="flex-1">
              <Button
                onPress={onClick}
                title={text}
                color={active ? colors.primary : colors.grayText}
                accessibilityLabel={text}
              />
              <View className={borderClass} />
            </View>
          );
        } )
      }
  </View>
);

export default Tabs;
