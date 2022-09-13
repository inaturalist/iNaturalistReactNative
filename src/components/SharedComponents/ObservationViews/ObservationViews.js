// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList, Pressable, Text, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import useLoggedIn from "../../../sharedHooks/useLoggedIn";
import { textStyles, viewStyles } from "../../../styles/observations/obsList";
import BottomSheet from "../BottomSheet";
import Map from "../Map";
import EmptyList from "./EmptyList";
import GridItem from "./GridItem";
import useUploadStatus from "./hooks/useUploadStatus";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import LoginPrompt from "./LoginPrompt";
import ObsCard from "./ObsCard";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";

type Props = {
  loading: boolean,
  localObservations: Object,
  testID: string,
  taxonId?: number,
  mapHeight?: number,
  totalObservations?: number,
  handleEndReached?: Function,
  syncObservations?: Function
}

const ObservationViews = ( {
  loading,
  localObservations,
  testID,
  taxonId,
  mapHeight,
  totalObservations,
  handleEndReached,
  syncObservations
}: Props ): Node => {
  const [view, setView] = useState( "list" );
  const navigation = useNavigation( );
  const { name } = useRoute( );
  const isLoggedIn = useLoggedIn( );
  const { uploadInProgress, updateUploadStatus } = useUploadStatus( );
  const { observationList, unuploadedObsList, allObsToUpload } = localObservations;
  const numOfUnuploadedObs = unuploadedObsList?.length;
  const [hasScrolled, setHasScrolled] = useState( false );

  const { height } = Dimensions.get( "screen" );
  const FOOTER_HEIGHT = 75;
  const HEADER_HEIGHT = 101;
  const BUTTON_ROW_HEIGHT = 50;

  // using flatListHeight to make the bottom sheet snap points work when the flatlist
  // has only a few items and isn't scrollable
  const flatListHeight = height - (
    HEADER_HEIGHT + FOOTER_HEIGHT + BUTTON_ROW_HEIGHT
  );

  const onScroll = ( { nativeEvent } ) => {
    const { y } = nativeEvent.contentOffset;

    if ( y <= 0 ) {
      setHasScrolled( false );
    } else {
      setHasScrolled( true );
    }
  };

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

  const renderBottomSheet = ( ) => {
    if ( numOfUnuploadedObs === 0 ) { return null; }

    if ( isLoggedIn === false ) {
      return (
        <BottomSheet hasScrolled={hasScrolled}>
          <LoginPrompt />
        </BottomSheet>
      );
    }
    if ( uploadInProgress ) {
      return (
        <UploadProgressBar
          unuploadedObsList={unuploadedObsList}
          allObsToUpload={allObsToUpload}
        />
      );
    }
    return (
      <BottomSheet hasScrolled={hasScrolled}>
        <UploadPrompt
          uploadObservations={updateUploadStatus}
          numOfUnuploadedObs={numOfUnuploadedObs}
          updateUploadStatus={updateUploadStatus}
        />
      </BottomSheet>
    );
  };

  const renderFooter = ( ) => {
    if ( isLoggedIn === false ) { return <View />; }
    return loading
      ? <InfiniteScrollFooter />
      : <View style={viewStyles.footer} />;
  };

  const renderView = ( ) => {
    if ( view === "map" ) {
      return <Map taxonId={taxonId} mapHeight={mapHeight} />;
    }
    return (
      <>
        <FlatList
          data={observationList}
          key={view === "grid" ? 1 : 0}
          renderItem={view === "grid" ? renderGridItem : renderItem}
          numColumns={view === "grid" ? 2 : 1}
          testID={testID}
          ListEmptyComponent={renderEmptyState}
          onScroll={onScroll}
          onEndReached={handleEndReached}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ minHeight: flatListHeight }}
        />
        {renderBottomSheet( )}
      </>
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
