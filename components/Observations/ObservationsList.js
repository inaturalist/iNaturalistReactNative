// @flow strict-local

import React from "react";
import { FlatList, Text, SafeAreaView } from "react-native";
import type { Node } from "react";
import inatjs from "inaturalistjs";
import withObservables from "@nozbe/with-observables";

import ObsCard from "./ObsCard";
import viewStyles from "../../styles/observations/observationsList";
import useFetchObservations from "./hooks/fetchObservations";
import database from "../../model/database";

const enhance = withObservables( ["observations"], ( { observations } ) => {
  return {
    observations: database.collections
      .get( "observations" )
      .query()
      .observe()
  };
} );

const ObservationsList = ( { observations } ): Node => {
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} />;

  const renderEmptyState = ( ) => <Text testID="ObservationsList.emptyList">no observations</Text>;

  return (
    <SafeAreaView>
      <FlatList
        contentContainerStyle={viewStyles.background}
        data={observations}
        keyExtractor={extractKey}
        renderItem={renderItem}
        testID="ObservationsList.myObservations"
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

export default enhance( ObservationsList );
