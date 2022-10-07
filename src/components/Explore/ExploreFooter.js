// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import { ExploreContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { View } from "react-native";
import { viewStyles } from "styles/explore/exploreFilters";

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
      <Button
        level="primary"
        onPress={applyFiltersAndNavigate}
        text="Apply Filters"
        testID="ExploreFilters.applyFilters"
      />
    </View>
  );
};

export default ExploreFooter;
