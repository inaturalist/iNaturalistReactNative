// @flow

import React, { useContext } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";

const ObsList = ( ): Node => {
  const { observationList, setObservation } = useContext( ObservationContext );
  const navigation = useNavigation( );

  const navToObsDetails = observation => {
    console.log( observation.uuid, "observation" );
    setObservation( observation.uuid );
    navigation.navigate( "ObsDetails" );
  };
  // const navToObsDetails = observation => navigation.navigate( "ObsDetails", { obsId: observation.uuid } );
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => <EmptyList />;

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
