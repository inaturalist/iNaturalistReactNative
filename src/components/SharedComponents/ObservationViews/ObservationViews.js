// @flow

import * as React from "react";
import { FlatList, ActivityIndicator, View, Pressable, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { viewStyles } from "../../../styles/observations/obsList";

import GridItem from "./GridItem";
import EmptyList from "./EmptyList";
import ObsCard from "./ObsCard";
import Map from "../Map";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string,
  taxonId?: number
}

const ObservationViews = ( {
  loading,
  observationList,
  testID,
  taxonId
}: Props ): React.Node => {
  const [view, setView] = React.useState( "list" );
  const navigation = useNavigation( );
  const { name } = useRoute( );

  const navToObsDetails = observation => navigation.navigate( "ObsDetails", { uuid: observation.uuid } );

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => name !== "Explore" ? <EmptyList /> : null;

  const setGridView = ( ) => setView( "grid" );
  const setListView = ( ) => setView( "list" );
  const setMapView = ( ) => setView( "map" );

  const renderView = ( ) => {
    if ( view === "map" ) {
      return <Map taxonId={taxonId} />;
    } else {
      return (
        <FlatList
          data={observationList}
          key={view === "grid" ? 1 : 0}
          renderItem={view === "grid" ? renderGridItem : renderItem}
          numColumns={view === "grid" ? 4 : 1}
          testID={testID}
          ListEmptyComponent={renderEmptyState}
        />
      );
    }
  };

  return (
    <>
      <View style={viewStyles.toggleViewRow}>
        {name === "Explore" && (
          <Pressable
            onPress={setMapView}
            accessibilityRole="button"
            testID="Explore.toggleMapView"
          >
            <Text>map view</Text>
          </Pressable>
        )}
        <Pressable
          onPress={setListView}
          accessibilityRole="button"
        >
          <Text>list view</Text>
        </Pressable>
        <Pressable
          onPress={setGridView}
          testID="ObsList.toggleGridView"
          accessibilityRole="button"
        >
          <Text>grid view</Text>
        </Pressable>
      </View>
      {loading
        ? <ActivityIndicator />
        : renderView( )}
    </>
  );
};

export default ObservationViews;
