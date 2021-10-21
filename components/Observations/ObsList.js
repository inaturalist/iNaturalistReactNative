// @flow

import React from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
// import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import useFetchLocalObservations from "./hooks/fetchLocalObservations";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const ObsList = ( ): Node => {
  const navigation = useNavigation( );
  const navToObsDetails = ( ) => navigation.navigate( "ObsDetails" );
  const localObservations = useFetchLocalObservations( );
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  // useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => <EmptyList />;

  return (
    <ViewWithFooter>
      <FlatList
        data={localObservations}
        keyExtractor={extractKey}
        renderItem={renderItem}
        testID="ObsList.myObservations"
        ListEmptyComponent={renderEmptyState}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
