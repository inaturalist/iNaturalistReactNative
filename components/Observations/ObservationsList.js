// @flow strict-local

import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
import viewStyles from "../../styles/observations/observationsList";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";

const ObservationsList = ( ): Node => {
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  const handlePress = ( ) => console.log( "nav to obs details from obs list" );
  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={handlePress} />;

  const renderEmptyState = ( ) => <EmptyList />;

  return (
    <SafeAreaView>
      <FlatList
        contentContainerStyle={viewStyles.background}
        data={[]}
        keyExtractor={extractKey}
        renderItem={renderItem}
        testID="ObservationsList.myObservations"
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

export default ObservationsList;
