// @flow

import * as React from "react";
import { FlatList, View, Pressable, Text, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { viewStyles, textStyles } from "../../../styles/observations/obsList";
import GridItem from "./GridItem";
import EmptyList from "./EmptyList";
import ObsCard from "./ObsCard";
import Map from "../Map";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
// import { ObsEditContext } from "../../../providers/contexts";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string,
  taxonId?: number,
  mapHeight?: number,
  totalObservations?: number,
  handleEndReached?: Function,
  syncObservations?: Function
}

const ObservationViews = ( {
  loading,
  observationList,
  testID,
  taxonId,
  mapHeight,
  totalObservations,
  handleEndReached,
  syncObservations
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
      navigation.navigate( "ObsDetails", { observation } );
      // navigation.navigate( "ObsDetails", { uuid: observation.uuid } );
    // }
  };

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => {
    if ( name !== "Explore" ) {
      return loading ? <ActivityIndicator /> : <EmptyList />;
    }
    return null;
  };

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
      <View style={[viewStyles.toggleViewRow, isExplore && viewStyles.exploreButtons]}>
        {!isExplore && (
          <View style={viewStyles.toggleButtons}>
            <Pressable onPress={syncObservations}>
              <Icon name="sync" size={30} />
            </Pressable>
          </View>
        )}
        <View style={viewStyles.toggleButtons}>
          {isExplore && (
            <Pressable
              onPress={setMapView}
              accessibilityRole="button"
              testID="Explore.toggleMapView"
            >
              <Icon name="map-outline" size={30} />
            </Pressable>
          )}
          <Pressable
            onPress={setListView}
            accessibilityRole="button"
          >
            <Icon name="format-list-bulleted" size={30} />
          </Pressable>
          <Pressable
            onPress={setGridView}
            testID="ObsList.toggleGridView"
            accessibilityRole="button"
          >
            <Icon name="grid-large" size={30} />
          </Pressable>
        </View>
      </View>
      {renderView( )}
    </>
  );
};

export default ObservationViews;
