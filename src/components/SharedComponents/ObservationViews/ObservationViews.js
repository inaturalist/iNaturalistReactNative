// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import Collapsible from "react-native-collapsible";

import useLoggedIn from "../../../sharedHooks/useLoggedIn";
import { textStyles, viewStyles } from "../../../styles/observations/obsList";
import Map from "../Map";
import EmptyList from "./EmptyList";
import GridItem from "./GridItem";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import ObsCard from "./ObsCard";
import ObsListHeader from "./ObsListHeader";
import Toolbar from "./Toolbar";

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
  const { observationList, unuploadedObsList } = localObservations;
  const numOfUnuploadedObs = unuploadedObsList?.length;
  const [hasScrolled, setHasScrolled] = useState( false );

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

  const { t } = useTranslation( );

  const renderFooter = ( ) => {
    if ( isLoggedIn === false ) { return null; }
    return loading
      ? <InfiniteScrollFooter />
      : <View style={viewStyles.footer} />;
  };

  const isExplore = name === "Explore";

  const renderToolbar = ( ) => (
    <View style={[
      viewStyles.toggleViewRow,
      isExplore && viewStyles.exploreButtons]}
    >
      <Toolbar
        isExplore={isExplore}
        isLoggedIn={isLoggedIn}
        syncObservations={syncObservations}
        setView={setView}
      />
    </View>
  );

  const handleScroll = ( { nativeEvent } ) => {
    const { y } = nativeEvent.contentOffset;

    if ( y <= 0 ) {
      setHasScrolled( false );
    } else {
      setHasScrolled( true );
    }
  };

  const renderHeader = ( ) => (
    <>
      <Collapsible collapsed={hasScrolled} easing="easeOutQuart">
        <ObsListHeader numOfUnuploadedObs={numOfUnuploadedObs} isLoggedIn={isLoggedIn} />
      </Collapsible>
      {renderToolbar( )}
    </>
  );

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
        onScroll={handleScroll}
        onEndReached={handleEndReached}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
      />
    );
  };

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
        : renderView( )}
    </View>
  );
};

export default ObservationViews;
