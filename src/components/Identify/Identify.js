// @flow

import React, { useState } from "react";
import type { Node } from "react";
import { Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useObservations from "./hooks/useObservations";
import GridView from "./GridView";
import DropdownPicker from "../Explore/DropdownPicker";
import { viewStyles } from "./../../styles/identify/identify";
import CardSwipeView from "./CardSwipeView";

const Identify = ( ): Node => {
  const [view, setView] = React.useState( "grid" );
  const [location, setLocation] = useState( "" );
  const [placeId, setPlaceId] = useState( null );
  const [taxon, setTaxon] = useState( "" );
  const [taxonId, setTaxonId] = useState( null );
  const { observations, loading } = useObservations( placeId, taxonId );

  const updatePlaceId = ( getValue ) => setPlaceId( getValue( ) );
  const updateTaxonId = ( getValue ) => setTaxonId( getValue( ) );

  const setGridView = ( ) => setView( "grid" );
  const setCardView = ( ) => setView( "card" );

  const renderView = ( ) => {
    if ( view === "card" ) {
      return (
        <CardSwipeView
          loading={loading}
          observationList={observations}
          testID="Identify.cardView"
        />
      );
    } else {
      return (
        <GridView
          loading={loading}
          observationList={observations}
          testID="Identify.observationGrid"
        />
      );
    }
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
