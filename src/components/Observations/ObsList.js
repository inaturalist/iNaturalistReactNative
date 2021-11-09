// @flow

// @fbt {"project": "internationalization-test"}

import React from "react";
import { FlatList, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import fbt from "fbt";

import ObsCard from "./ObsCard";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import useFetchObsListFromRealm from "./hooks/fetchObsListFromRealm";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const ObsList = ( ): Node => {
  const navigation = useNavigation( );
  const navToObsDetails = observation => navigation.navigate( "ObsDetails", { obsId: observation.uuid } );
  const localObservations = useFetchObsListFromRealm( );
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  useFetchObservations( );

  const extractKey = item => item.uuid;
  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => <EmptyList />;

  const FBTExampleTitle = ( ) => (
    <Text>
      <fbt desc="Section Description">
        Edit App.js to change this screen and then come back to see
        your edits.
      </fbt>
      {/* <fbt project="foo" desc="a simple example">
        below is the observation list
      </fbt> */}
    </Text>
  );

  return (
    <ViewWithFooter>
      <FlatList
        data={localObservations}
        keyExtractor={extractKey}
        renderItem={renderItem}
        testID="ObsList.myObservations"
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={FBTExampleTitle}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
