// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList, Pressable, Text, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import useLoggedIn from "../../../sharedHooks/useLoggedIn";
import { textStyles, viewStyles } from "../../../styles/observations/obsList";
import Map from "../Map";
import EmptyList from "./EmptyList";
import GridItem from "./GridItem";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import ObsCard from "./ObsCard";

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
  const [view, setView] = React.useState( "list" );
  const navigation = useNavigation( );
  const { name } = useRoute( );
  const isLoggedIn = useLoggedIn( );

  const navToObsDetails = async observation => {
    navigation.navigate( "ObsDetails", { observation } );
  };

  const renderItem = ( { item } ) => (
    <ObsCard item={item} handlePress={navToObsDetails} />
  );
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => {
    if ( name !== "Explore" && isLoggedIn === false ) {
      return <EmptyList />;
    }
    return null;
  };

  const setGridView = ( ) => setView( "grid" );
  const setListView = ( ) => setView( "list" );
  const setMapView = ( ) => setView( "map" );

  const { t } = useTranslation( );

  const renderFooter = ( ) => {
    if ( isLoggedIn === false ) { return null; }
    return loading
      ? <InfiniteScrollFooter />
      : <View style={viewStyles.footer} />;
  };

  const renderView = ( ) => {
    if ( view === "map" ) {
      return <Map taxonId={taxonId} mapHeight={mapHeight} />;
    }
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
  };

  const isExplore = name === "Explore";

  const renderButtonsRow = ( ) => (
    <View style={[viewStyles.toggleViewRow, isExplore && viewStyles.exploreButtons]}>
      {!isExplore && (
      <View style={viewStyles.toggleButtons}>
        {isLoggedIn && (
        <Pressable onPress={syncObservations}>
          <Icon name="sync" size={30} />
        </Pressable>
        )}
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
  );

  return (
    <View testID="ObservationViews.myObservations">
      {isExplore && (
        <View style={[viewStyles.whiteBanner, view === "map" && viewStyles.greenBanner]}>
          <Text style={[textStyles.center, view === "map" && textStyles.whiteText]}>
            {t( "X-Observations", { observationCount: totalObservations } )}
          </Text>
        </View>
      )}
      {observationList.length === 0
        ? renderEmptyState( )
        : (
          <>
            {renderButtonsRow( )}
            {renderView( )}
          </>
        )}
    </View>
  );
};

export default ObservationViews;
