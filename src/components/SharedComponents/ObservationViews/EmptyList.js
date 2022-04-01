// @flow strict-local

import React from "react";
import { Text, View } from "react-native";
import type { Node } from "react";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";

const EmptyList = ( ): Node => {
  // const handlePress = ( ) => console.log( "navigate to learn more" );

  return (
    <View style={viewStyles.center}>
      <Text style={textStyles.text} testID="ObsList.emptyList">welcome to inaturalist!</Text>
      <Text style={textStyles.text}>make sure you're logged in to fetch observations</Text>
    </View>
  );
};

export default EmptyList;
