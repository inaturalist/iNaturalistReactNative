import {
  Body1,
  INatIcon,
  ScrollViewWrapper,
} from "components/SharedComponents";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import { View } from "components/styledComponents";
import React from "react";
import { Alert } from "react-native";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const Icons = ( ) => (
  <ScrollViewWrapper>
    <View className="p-4">
      {Object.keys( glyphmap )
        .sort()
        .map( iconName => (
          <View key={`icons-${iconName}`} className="flex-1 flex-row mb-2">
            <View className="mr-3">
              <INatIcon
                name={iconName}
                key={iconName}
                onPress={() => Alert.alert( "", `You tapped on the ${iconName} icon` )}
                size={32}
              />
            </View>
            <Body1>
              {iconName}
            </Body1>
          </View>
        ) )}
    </View>
  </ScrollViewWrapper>
);

export default Icons;
