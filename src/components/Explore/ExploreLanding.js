// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useContext } from "react";
import { View } from "react-native";

// import DropdownPicker from "./DropdownPicker";
import { ExploreContext } from "../../providers/contexts";
import { textStyles, viewStyles } from "../../styles/explore/explore";
import Button from "../SharedComponents/Buttons/Button";
import TranslatedText from "../SharedComponents/TranslatedText";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
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
      <TranslatedText text="Explore" />
      <TranslatedText style={textStyles.explanation} text="Visually-search-iNaturalist-data" />
      <FiltersIcon />
      <TaxonLocationSearch />
      <View style={viewStyles.positionBottom}>
        <Button
          level="primary"
          text="Explore"
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
