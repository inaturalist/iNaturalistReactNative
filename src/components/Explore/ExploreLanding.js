// @flow

import React, { useContext } from "react";
import type { Node } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { textStyles, viewStyles } from "../../styles/explore/explore";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
// import DropdownPicker from "./DropdownPicker";
import { ExploreContext } from "../../providers/contexts";
import TranslatedText from "../SharedComponents/TranslatedText";
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
        <RoundGreenButton
          buttonText="Explore"
          handlePress={navToExplore}
          testID="Explore.fetchObservations"
          disabled={!taxonId}
        />
      </View>
    </ViewWithFooter>
  );
};

export default Explore;
