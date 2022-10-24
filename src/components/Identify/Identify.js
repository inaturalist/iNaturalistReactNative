// @flow

import { searchObservations } from "api/observations";
import DropdownPicker from "components/Explore/DropdownPicker";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { viewStyles } from "styles/identify/identify";

import CardSwipeView from "./CardSwipeView";
import GridView from "./GridView";

const Identify = ( ): Node => {
  const [view, setView] = React.useState( "grid" );
  const [location, setLocation] = useState( "" );
  const [placeId, setPlaceId] = useState( null );
  const [taxon, setTaxon] = useState( "" );
  const [taxonId, setTaxonId] = useState( null );

  const searchParams = {
    reviewed: false,
    fields: Observation.FIELDS
  };

  if ( placeId ) {
    // $FlowIgnore
    searchParams.place_id = placeId;
  }
  if ( taxonId ) {
    // $FlowIgnore
    searchParams.taxon_id = taxonId;
  }

  const {
    data: observations,
    isLoading
  } = useAuthenticatedQuery(
    ["searchObservations"],
    optsWithAuth => searchObservations( searchParams, optsWithAuth )
  );

  const updatePlaceId = getValue => setPlaceId( getValue( ) );
  const updateTaxonId = getValue => setTaxonId( getValue( ) );

  const setGridView = ( ) => setView( "grid" );
  const setCardView = ( ) => setView( "card" );

  const renderView = ( ) => {
    if ( view === "card" ) {
      return (
        <CardSwipeView observationList={observations} />
      );
    }
    return (
      <GridView
        loading={isLoading}
        observationList={observations}
        testID="Identify.observationGrid"
      />
    );
  };

  const { t } = useTranslation( );

  return (
    <ViewWithFooter>
      <View style={viewStyles.toggleViewRow}>
        <Pressable
          onPress={setCardView}
          accessibilityRole="button"
        >
          <Text>{ t( "Card-View" ) }</Text>
        </Pressable>
        <Pressable
          onPress={setGridView}
          testID="ObsList.toggleGridView"
          accessibilityRole="button"
        >
          <Text>{ t( "Grid-View" ) }</Text>
        </Pressable>
      </View>
      <DropdownPicker
        searchQuery={location}
        setSearchQuery={setLocation}
        setValue={updatePlaceId}
        sources="places"
        value={placeId}
      />
      <DropdownPicker
        searchQuery={taxon}
        setSearchQuery={setTaxon}
        setValue={updateTaxonId}
        sources="taxa"
        value={taxonId}
      />
      {renderView( )}
    </ViewWithFooter>
  );
};

export default Identify;
