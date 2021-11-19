// @flow

import React, { useContext, useEffect } from "react";
import { FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";

const ObsList = ( ): Node => {
  const { observationList, updateObservationId, fetchObservations } = useContext( ObservationContext );
  const navigation = useNavigation( );

  const navToObsDetails = observation => {
    updateObservationId( observation.uuid );
    navigation.navigate( "ObsDetails" );
  };
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  // this will eventually go in a sync button / pull-from-top gesture
  // instead of automatically fetching every time the component loads
  const hasLoaded = observationList.length > 0;
  const loading = useFetchObservations( hasLoaded );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => <EmptyList />;

  useEffect( ( ) => {
    // addListener is here to make sure the collection from realm is the most recent, valid
    // collection, even after a user taps into obs detail and then comes back to
    // the observation list screen. otherwise, realm results will error as invalidated objects
    const unsub = navigation.addListener( "focus", ( ) => {
      fetchObservations( );
    } );

    return unsub;
  } );

  return (
    <ViewWithFooter>
      {loading
        ? <ActivityIndicator />
        : (
          <FlatList
            data={observationList}
            keyExtractor={extractKey}
            renderItem={renderItem}
            testID="ObsList.myObservations"
            ListEmptyComponent={renderEmptyState}
          />
        )
      }
    </ViewWithFooter>
  );
};

export default ObsList;
