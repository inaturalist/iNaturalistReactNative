// @flow

import React, { useContext, useEffect } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";

const ObsList = ( ): Node => {
  const { observationList, setObservation, fetchObservations } = useContext( ObservationContext );
  const navigation = useNavigation( );

  const navToObsDetails = observation => {
    setObservation( observation.uuid );
    navigation.navigate( "ObsDetails" );
  };
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => <EmptyList />;

  useEffect( ( ) => {
    // this is here to make sure the collection from realm is the most recent, valid
    // collection, even after a user taps into obs detail and then comes back to
    // the observation list screen. otherwise, many realm access errors
    const unsub = navigation.addListener( "focus", ( ) => {
      fetchObservations( );
    } );

    return unsub;
  } );

  return (
    <ViewWithFooter>
      <FlatList
        data={observationList}
        keyExtractor={extractKey}
        renderItem={renderItem}
        testID="ObsList.myObservations"
        ListEmptyComponent={renderEmptyState}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
