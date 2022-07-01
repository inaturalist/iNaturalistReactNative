// @flow

import React from "react";
import { Text, View } from "react-native";
import type { Node } from "react";
import { t } from "i18next";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";

const EmptyList = ( ): Node => {
  // const handlePress = ( ) => console.log( "navigate to learn more" );

  return (
    <View style={viewStyles.center}>
      <Text style={textStyles.text} testID="ObsList.emptyList">{t( "iNaturalist-is-a-community-of-naturalists" )}</Text>
    </View>
  );
};

export default EmptyList;
