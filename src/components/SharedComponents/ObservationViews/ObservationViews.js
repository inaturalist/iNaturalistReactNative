// @flow

import * as React from "react";
import { FlatList, View, Pressable, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { viewStyles, textStyles } from "../../../styles/observations/obsList";
import GridItem from "./GridItem";
import EmptyList from "./EmptyList";
import ObsCard from "./ObsCard";
import Map from "../Map";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import { ObsEditContext } from "../../../providers/contexts";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string,
  taxonId?: number,
  mapHeight?: number,
  totalObservations?: number,
  handleEndReached?: Function
}

const ObservationViews = ( {
  loading,
  observationList,
  testID,
  taxonId,
  mapHeight,
  totalObservations,
  handleEndReached
}: Props ): React.Node => {
  // const { openSavedObservation } = React.useContext( ObsEditContext );
  const [view, setView] = React.useState( "list" );
  const navigation = useNavigation( );
  const { name } = useRoute( );

  const navToObsDetails = async ( observation ) => {
    // const needsUpload = observation._synced_at === null;
    // if ( needsUpload ) {
    //   await openSavedObservation( observation.uuid );
    //   navigation.navigate( "camera", {
    //     screen: "ObsEdit"
    //   } );
    // } else {
      navigation.navigate( "ObsDetails", { uuid: observation.uuid } );
    // }
  };

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => name !== "Explore" ? <EmptyList /> : null;

  const setGridView = ( ) => setView( "grid" );
  const setListView = ( ) => setView( "list" );
  const setMapView = ( ) => setView( "map" );

  const { t } = useTranslation( );

  const renderFooter = ( ) => loading ? <InfiniteScrollFooter /> : <View style={viewStyles.footer} />;

  const renderView = ( ) => {
    if ( view === "map" ) {
      return <Map taxonId={taxonId} mapHeight={mapHeight} />;
    } else {
      return (
        <FlatList
          data={observationList}
          key={view === "grid" ? 1 : 0}
          renderItem={view === "grid" ? renderGridItem : renderItem}
          numColumns={view === "grid" ? 2 : 1}
          testID={testID}
          ListEmptyComponent={renderEmptyState}
          onEndReached={handleEndReached}
          ListFooterComponent={renderFooter}
        />
      );
    }
  };

  const isExplore = name === "Explore";

  return (
    <>
      {isExplore && (
        <View style={[viewStyles.whiteBanner, view === "map" && viewStyles.greenBanner]}>
          <Text style={[textStyles.center, view === "map" && textStyles.whiteText]}>{t( "X-Observations", { observationCount: totalObservations } )}</Text>
        </View>
      )}
      <View style={[viewStyles.toggleViewRow, isExplore ? viewStyles.exploreButtons : viewStyles.obsListButtons]}>
        {isExplore && (
          <Pressable
            onPress={setMapView}
            accessibilityRole="button"
            testID="Explore.toggleMapView"
          >
            <Text>map</Text>
          </Pressable>
        )}
        <Pressable
          onPress={setListView}
          accessibilityRole="button"
        >
          <Text>list</Text>
        </Pressable>
        <Pressable
          onPress={setGridView}
          testID="ObsList.toggleGridView"
          accessibilityRole="button"
        >
          <Text>grid</Text>
        </Pressable>
      </View>
      {renderView( )}
    </>
  );
};

export default ObservationViews;
