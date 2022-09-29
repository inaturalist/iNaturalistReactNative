// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import { textStyles, viewStyles } from "styles/sharedComponents/observationViews/obsCard";

const EmptyList = ( ): Node => (
  <View style={viewStyles.center}>
    <Text style={textStyles.text} testID="ObsList.emptyList">
      {t( "iNaturalist-is-a-community-of-naturalists" )}
    </Text>
  </View>
);
export default EmptyList;
