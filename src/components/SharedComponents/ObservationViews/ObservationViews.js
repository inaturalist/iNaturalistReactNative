// @flow

import * as React from "react";
import { FlatList, ActivityIndicator, View, Pressable, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { viewStyles } from "../../../styles/observations/obsList";

import GridItem from "./GridItem";
import EmptyList from "./EmptyList";
import ObsCard from "./ObsCard";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string
}

const ObservationViews = ( {
  loading,
  observationList,
  testID
}: Props ): React.Node => {
  const [view, setView] = React.useState( "list" );
  const navigation = useNavigation( );
  const { name } = useRoute( );

  const navToObsDetails = observation => navigation.navigate( "ObsDetails", { uuid: observation.uuid } );

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => name !== "Explore" ? <EmptyList /> : null;

  const setListView = ( ) => setView( "list" );
  const setGridView = ( ) => setView( "grid" );

  return (
    <>
      <View style={viewStyles.toggleViewRow}>
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
        : (
          <FlatList
            data={observationList}
            key={view === "grid" ? 1 : 0}
            renderItem={view === "grid" ? renderGridItem : renderItem}
            numColumns={view === "grid" ? 4 : 1}
            testID={testID}
            ListEmptyComponent={renderEmptyState}
          />
        )}
    </>
  );
};

export default ObservationViews;
