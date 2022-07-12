// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { View } from "react-native";

import { ExploreContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/explore/exploreFilters";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

const ExploreFooter = ( ): Node => {
  const { applyFilters, resetUnappliedFilters } = React.useContext( ExploreContext );
  const navigation = useNavigation( );

  const applyFiltersAndNavigate = ( ) => {
    applyFilters( );
    navigation.goBack( );
  };

  const clearFiltersAndNavigate = ( ) => {
    resetUnappliedFilters( );
    navigation.goBack( );
  };

  return (
    <View style={viewStyles.footer}>
      <HeaderBackButton onPress={clearFiltersAndNavigate} style={viewStyles.element} />
      <RoundGreenButton
        handlePress={applyFiltersAndNavigate}
        buttonText="Apply Filters"
        testID="ExploreFilters.applyFilters"
      />
    </View>
  );
};

export default ExploreFooter;
