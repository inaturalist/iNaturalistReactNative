// @flow

import React, { useContext, useEffect, useState } from "react";
import { FlatList, ActivityIndicator, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";

import ObsCard from "./ObsCard";
import useFetchObservations from "./hooks/fetchObservations";
import EmptyList from "./EmptyList";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/observations/obsList";
import GridItem from "./GridItem";

const ObsList = ( ): Node => {
  const [view, setView] = useState( "list" );
  const { observationList, fetchObservations } = useContext( ObservationContext );
  const navigation = useNavigation( );

  const navToObsDetails = observation => navigation.navigate( "ObsDetails", { uuid: observation.uuid } );
  // this custom hook fetches on first component render
  // (and anytime you save while in debug - hot reloading mode )
  // this will eventually go in a sync button / pull-from-top gesture
  // instead of automatically fetching every time the component loads
  const loading = useFetchObservations( );

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

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

  const toggleView = ( ) => view === "list" ? setView( "grid" ) : setView( "list" );

  return (
    <ViewWithFooter>
      <View style={viewStyles.toggleViewRow}>
        <Pressable onPress={toggleView}>
          <Text>list view</Text>
        </Pressable>
        <Pressable onPress={toggleView}>
          <Text>grid view</Text>
        </Pressable>
      </View>
      {loading
        ? <ActivityIndicator />
        : (
          <FlatList
            data={observationList}
            key={view === "grid" ? 1 : 0}
            renderItem={view === "grid" ? renderGridItem : renderItem}
            numColumns={view === "grid" ? 4 : 1}
            testID="ObsList.myObservations"
            ListEmptyComponent={renderEmptyState}
          />
        )
      }
    </ViewWithFooter>
  );
};

export default ObsList;
