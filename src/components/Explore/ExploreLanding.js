// @flow

import { useNavigation } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ExploreContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { textStyles, viewStyles } from "styles/explore/explore";

import FiltersIcon from "./FiltersIcon";
import TaxonLocationSearch from "./TaxonLocationSearch";

const Explore = ( ): Node => {
  const {
    setLoading,
    exploreFilters
  } = useContext( ExploreContext );
  const navigation = useNavigation( );

  const navToExplore = ( ) => {
    setLoading( );
    navigation.navigate( "Explore" );
  };

  const taxonId = exploreFilters ? exploreFilters.taxon_id : null;

  return (
    <ViewWithFooter>
      <Text style={textStyles.explanation}>
        {t( "Visually-search-iNaturalist-data" )}
      </Text>
      <FiltersIcon />
      <TaxonLocationSearch />
      <View style={viewStyles.positionBottom}>
        <Button
          level="primary"
          text={t( "Explore" )}
          onPress={navToExplore}
          // eslint-disable-next-line react-native/no-inline-styles
          style={viewStyles.button}
          testID="Explore.fetchObservations"
          disabled={!taxonId}
        />
      </View>
    </ViewWithFooter>
  );
};

export default Explore;
