// @flow strict-local

import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Node } from "react";

import { viewStyles, textStyles } from "../../styles/observations/obsCard";

const EmptyList = ( ): Node => {
  const handlePress = ( ) => console.log( "navigate to learn more" );

  return (
    <View style={viewStyles.center}>
      <Text style={textStyles.text} testID="ObsList.emptyList">welcome to inaturalist!</Text>
      <Text style={textStyles.text}>make an obs of an organism, and iNat's AI...</Text>
      <Pressable
        onPress={handlePress}
        style={viewStyles.row}
        accessibilityRole="button"
      >
        <Text style={textStyles.text}>learn more</Text>
      </Pressable>
    </View>
  );
};

export default EmptyList;
