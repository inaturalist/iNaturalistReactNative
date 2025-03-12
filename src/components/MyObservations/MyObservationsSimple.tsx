import { useNavigation, useRoute } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  AccountCreationCard,
  // FiftyObservationCard,
  FirstObservationCard,
  SecondObservationCard
} from "components/OnboardingModal/PivotCards.tsx";
import {
  Body1,
  InfiniteScrollLoadingWheel,
  OfflineNotice,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import CustomFlashList from "components/SharedComponents/FlashList/CustomFlashList.tsx";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import Realm from "realm";
import Photo from "realmModels/Photo";
import type {
  RealmObservation,
  RealmTaxon,
  RealmUser
} from "realmModels/types";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import { useGridLayout, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";
import MyObservationsSimpleHeader from "./MyObservationsSimpleHeader";
import SimpleErrorHeader from "./SimpleErrorHeader";
import SimpleTaxonGridItem from "./SimpleTaxonGridItem";
import StatTab from "./StatTab";

export interface Props {
  activeTab: string;
  currentUser?: RealmUser;
  handleIndividualUploadPress: ( uuid: string ) => void;
  handlePullToRefresh: ( ) => void;
  handleSyncButtonPress: ( ) => void;
  isConnected: boolean;
  isFetchingNextPage: boolean;
  layout: "list" | "grid";
  listRef?: React.RefObject<FlashList<RealmObservation>>;
  numTotalObservations?: number;
  numTotalTaxa?: number;
  numUnuploadedObservations: number;
  observations: RealmObservation[];
  onEndReached: ( ) => void;
  onListLayout?: ( ) => void;
  onScroll?: ( ) => void;
  setActiveTab: ( newTab: string ) => void;
  setShowLoginSheet: ( newValue: boolean ) => void;
  showLoginSheet: boolean;
  showNoResults: boolean;
  taxa?: RealmTaxon[] | Realm.Results;
  toggleLayout: ( ) => void;
  fetchMoreTaxa: ( ) => void;
  isFetchingTaxa?: boolean;
  justFinishedSignup?: boolean;
  refetchTaxa: ( ) => void;
}

interface TaxaFlashListRenderItemProps {
  // I'm pretty sure this is some kind of bug ~~~~kueda 20250108
  // eslint-disable-next-line react/no-unused-prop-types
  item: RealmTaxon;
}

export const OBSERVATIONS_TAB = "observations";
export const TAXA_TAB = "taxa";

const MyObservationsSimple = ( {
  activeTab,
  currentUser,
  handleIndividualUploadPress,
  handlePullToRefresh,
  handleSyncButtonPress,
  isConnected,
  isFetchingNextPage,
  layout,
  listRef,
  numTotalObservations,
  numTotalTaxa,
  numUnuploadedObservations,
  observations,
  onEndReached,
  onListLayout,
  onScroll,
  setActiveTab,
  setShowLoginSheet,
  showLoginSheet,
  showNoResults,
  taxa,
  toggleLayout,
  fetchMoreTaxa,
  isFetchingTaxa,
  justFinishedSignup = false,
  refetchTaxa
}: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const route = useRoute( );

  const {
    estimatedGridItemSize,
    flashListStyle,
    gridItemStyle,
    numColumns
  } = useGridLayout( );
  const taxaFlashListStyle = useMemo( ( ) => ( {
    ...flashListStyle,
    paddingTop: 10
  } ), [flashListStyle] );

  const renderTaxaItem = useCallback( ( { item: taxon }: TaxaFlashListRenderItemProps ) => {
    const taxonId = taxon.id;
    const navToTaxonDetails = ( ) => (
      // Again, not sure how to placate TypeScript w/ React Navigation
      navigation.navigate( {
        // Ensure button mashing doesn't open multiple TaxonDetails instances
        key: `${route.key}-TaxonGridItem-TaxonDetails-${taxonId}`,
        name: "TaxonDetails",
        params: { id: taxonId }
      } )
    );

    const accessibleName = accessibleTaxonName( taxon, currentUser, t );

    const source = {
      uri: Photo.displayLocalOrRemoteMediumPhoto(
        taxon?.default_photo
      )
    };

    // Add a unique key to ensure component recreation
    // so images don't get recycled and show on the wrong taxon
    const itemKey = `taxon-${taxonId}-${source.uri}`;

    return (
      <SimpleTaxonGridItem
        key={itemKey}
        style={gridItemStyle}
        taxon={taxon}
        navToTaxonDetails={navToTaxonDetails}
        accessibleName={accessibleName}
        source={source}
      />
    );
  }, [
    currentUser,
    gridItemStyle,
    navigation,
    route.key,
    t
  ] );

  const renderTaxaFooter = useCallback( ( ) => {
    if ( isFetchingTaxa ) {
      return (
        <InfiniteScrollLoadingWheel
          hideLoadingWheel={false}
          layout={layout}
          isConnected={isConnected}
        />
      );
    }
    if ( !taxa?.length ) {
      return (
        <View className="w-full h-full p-5 justify-center align-center text-center">
          <Body1 className="text-center">{ t( "You-havent-observed-any-species-yet" ) }</Body1>
        </View>
      );
    }
    return <View />;
  }, [
    layout,
    isConnected,
    isFetchingTaxa,
    t,
    taxa?.length
  ] );

  const obsMissingBasicsExist = useMemo( ( ) => (
    numUnuploadedObservations > 0 && !!observations.find( o => o.needsSync() && o.missingBasics( ) )
  ), [numUnuploadedObservations, observations] );

  const renderTabComponent = ( { id } ) => (
    <StatTab
      id={id}
      numTotalObservations={numTotalObservations}
      numTotalTaxa={numTotalTaxa}
    />
  );

  const dataFilledWithEmptyBoxes = useMemo( ( ) => {
    const data = observations.filter( o => o.isValid() );
    // In grid layout fill up to 8 items to make sure the grid is filled
    if ( layout === "grid" ) {
    // Fill up to 8 items to make sure the grid is filled
      const emptyBoxes = new Array( 8 - ( data.length % 8 ) ).fill( { empty: true } );
      // Add random id to empty boxes to ensure they are unique
      const emptyBoxesWithId = emptyBoxes.map( ( box, index ) => ( {
        ...box,
        id: `empty-${index}`
      } ) );
      return [...data, ...emptyBoxesWithId];
    }
    return data;
  }, [observations, layout] );

  const renderOfflineNotice = ( ) => {
    if ( isConnected === false ) {
      return (
        <View className="flex-1 items-center justify-center">
          <OfflineNotice onPress={refetchTaxa} />
        </View>
      );
    }
    return null;
  };

  return (
    <>
      <ViewWrapper>
        <MyObservationsSimpleHeader
          currentUser={currentUser}
          isConnected={isConnected}
          numUnuploadedObservations={numUnuploadedObservations}
          handleSyncButtonPress={handleSyncButtonPress}
        />
        <Tabs
          activeColor={String( colors?.inatGreen )}
          activeId={activeTab}
          tabs={[
            {
              id: OBSERVATIONS_TAB,
              text: t( "Observations" ),
              onPress: () => setActiveTab( OBSERVATIONS_TAB )
            },
            {
              id: TAXA_TAB,
              text: t( "Species" ),
              onPress: () => setActiveTab( TAXA_TAB )
            }
          ]}
          TabComponent={renderTabComponent}
        />
        { activeTab === OBSERVATIONS_TAB && (
          <>
            <ObservationsFlashList
              data={dataFilledWithEmptyBoxes}
              dataCanBeFetched={!!currentUser}
              handlePullToRefresh={handlePullToRefresh}
              handleIndividualUploadPress={handleIndividualUploadPress}
              hideLoadingWheel
              hideMetadata
              hideObsUploadStatus={!currentUser}
              hideObsStatus
              isFetchingNextPage={isFetchingNextPage}
              isConnected={isConnected}
              obsListKey="MyObservations"
              layout={layout}
              onEndReached={onEndReached}
              onLayout={onListLayout}
              onScroll={onScroll}
              ref={listRef}
              showObservationsEmptyScreen
              showNoResults={showNoResults}
              testID="MyObservationsAnimatedList"
              renderHeader={currentUser && ( obsMissingBasicsExist
                ? <SimpleErrorHeader isConnected={isConnected} />
                : <Announcements isConnected={isConnected} /> )}
            />
            <ObservationsViewBar
              gridFirst
              hideMap
              layout={layout}
              updateObservationsView={toggleLayout}
            />
          </>
        ) }
        { ( activeTab === TAXA_TAB && taxa.length > 0 ) && (
          <CustomFlashList
            canFetch={!!currentUser}
            contentContainerStyle={taxaFlashListStyle}
            data={taxa}
            estimatedItemSize={estimatedGridItemSize}
            hideLoadingWheel
            isConnected={isConnected}
            keyExtractor={(
              item: RealmTaxon
            ) => `${item.id}-${item?.default_photo?.url || "no-photo"}`}
            layout="grid"
            numColumns={numColumns}
            renderItem={renderTaxaItem}
            totalResults={numTotalTaxa}
            onEndReached={
              currentUser
                ? fetchMoreTaxa
                : undefined
            }
            refreshing={isFetchingTaxa}
            ListFooterComponent={renderTaxaFooter}
          />
        )}
        { ( activeTab === TAXA_TAB && taxa.length === 0 ) && renderOfflineNotice( )}
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
      {/* These four cards should show only in default mode */}
      <FirstObservationCard triggerCondition={numTotalObservations === 1} />
      <SecondObservationCard triggerCondition={numTotalObservations === 2} />
      {/* This card was showing up at the wrong places but probably needs other code changes
          before we can turn it back on.
      <FiftyObservationCard triggerCondition={!!currentUser && numTotalObservations >= 50} />
      */}
      <AccountCreationCard
        triggerCondition={
          justFinishedSignup && !!currentUser && numTotalObservations < 20
        }
      />
    </>
  );
};

export default MyObservationsSimple;
