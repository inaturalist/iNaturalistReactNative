import { useNavigation, useRoute } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import ObsGridItem from "components/ObservationsFlashList/ObsGridItem";
import {
  AccountCreationCard,
  FiftyObservationCard,
  FiveObservationCard,
  OneObservationCard
} from "components/OnboardingModal/PivotCards.tsx";
import {
  Body1,
  InfiniteScrollLoadingWheel,
  OfflineNotice,
  PerformanceDebugView,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import CustomFlashList from "components/SharedComponents/FlashList/CustomFlashList.tsx";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import Photo from "realmModels/Photo.ts";
import type {
  RealmObservation,
  RealmTaxon,
  RealmUser
} from "realmModels/types";
import { accessibleTaxonName } from "sharedHelpers/taxon.ts";
import { useGridLayout, useLayoutPrefs, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";
import MyObservationsSimpleHeader from "./MyObservationsSimpleHeader";
import SimpleErrorHeader from "./SimpleErrorHeader";
import SimpleTaxonGridItem from "./SimpleTaxonGridItem";
import StatTab from "./StatTab";

interface SpeciesCount {
  count: number,
  taxon: RealmTaxon
}

export interface Props {
  activeTab: string;
  currentUser?: RealmUser;
  fetchFromLastObservation: ( id: number ) => void;
  handleIndividualUploadPress: ( uuid: string ) => void;
  handlePullToRefresh: ( ) => void;
  handleSyncButtonPress: ( _p: { unuploadedObsMissingBasicsIDs: string[] } ) => void;
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
  taxa?: SpeciesCount[];
  toggleLayout: ( ) => void;
  fetchMoreTaxa: ( ) => void;
  isFetchingTaxa?: boolean;
  justFinishedSignup: boolean;
  loggedInWhileInDefaultMode?: boolean;
  refetchTaxa: ( ) => void;
}

interface TaxaFlashListRenderItemProps {
  // I'm pretty sure this is some kind of bug ~~~~kueda 20250108
  // eslint-disable-next-line react/no-unused-prop-types
  item: SpeciesCount;
}

export const OBSERVATIONS_TAB = "observations";
export const TAXA_TAB = "taxa";

const MyObservationsSimple = ( {
  activeTab,
  currentUser,
  fetchFromLastObservation,
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
  justFinishedSignup,
  loggedInWhileInDefaultMode = false,
  refetchTaxa
}: Props ) => {
  const { isDefaultMode } = useLayoutPrefs( );
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

  const renderTaxaItem = useCallback( ( { item: speciesCount }: TaxaFlashListRenderItemProps ) => {
    const taxonId = speciesCount.taxon.id;
    const navToTaxonDetails = ( ) => (
      // Again, not sure how to placate TypeScript w/ React Navigation
      navigation.navigate( {
        // Ensure button mashing doesn't open multiple TaxonDetails instances
        key: `${route.key}-TaxonGridItem-TaxonDetails-${taxonId}`,
        name: "TaxonDetails",
        params: { id: taxonId }
      } )
    );

    const accessibleName = accessibleTaxonName( speciesCount.taxon, currentUser, t );

    const source = {
      uri: Photo.displayLocalOrRemoteMediumPhoto(
        speciesCount.taxon?.default_photo
      )
    };

    // Add a unique key to ensure component recreation
    // so images don't get recycled and show on the wrong taxon
    const itemKey = `taxon-${taxonId}-${source.uri}`;

    return (
      <SimpleTaxonGridItem
        key={itemKey}
        style={gridItemStyle}
        speciesCount={speciesCount}
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

  const unuploadedObsMissingBasicsIDs = useMemo( () => (
    observations
      .filter( o => o.needs_sync && o.missing_basics )
      .map( o => o.uuid )
  ), [observations] );

  const numUnuploadedObsMissingBasics = unuploadedObsMissingBasicsIDs.length;
  const obsMissingBasicsExist = useMemo( ( ) => (
    numUnuploadedObservations > 0 && numUnuploadedObsMissingBasics > 0
  ), [numUnuploadedObservations, numUnuploadedObsMissingBasics] );

  const numUploadableObservations = isDefaultMode
    ? numUnuploadedObservations - numUnuploadedObsMissingBasics
    : numUnuploadedObservations;

  const renderTabComponent = ( { id } ) => (
    <StatTab
      id={id}
      numTotalObservations={numTotalObservations}
      numTotalTaxa={numTotalTaxa}
    />
  );

  const dataFilledWithEmptyBoxes = useMemo( ( ) => {
    const data = observations;
    // In grid layout fill up to 8 items to make sure the grid is filled
    // but don't add the empty boxes at the end of a long existing list
    if ( layout === "grid" && data.length < 8 ) {
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

  const handlePivotCardGridItemPress = ( ) => {
    const { uuid } = observations[0];
    navigation.navigate( {
      key: `Obs-0-${uuid}`,
      name: "ObsDetails",
      params: { uuid }
    } );
  };

  return (
    <>
      <ViewWrapper>
        <MyObservationsSimpleHeader
          currentUser={currentUser}
          isConnected={isConnected}
          numUploadableObservations={numUploadableObservations}
          handleSyncButtonPress={() => {
            handleSyncButtonPress( { unuploadedObsMissingBasicsIDs } );
          }}
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
              fetchFromLastObservation={fetchFromLastObservation}
              handlePullToRefresh={handlePullToRefresh}
              handleIndividualUploadPress={handleIndividualUploadPress}
              hideLoadingWheel={!isFetchingNextPage}
              hideMetadata={isDefaultMode}
              hideObsUploadStatus={!currentUser}
              hideObsStatus={!currentUser}
              isSimpleObsStatus={isDefaultMode}
              hideRGLabel={!isDefaultMode || !currentUser}
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
              item: SpeciesCount
            ) => `${item.taxon.id}-${item?.taxon?.default_photo?.url || "no-photo"}`}
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
      {isDefaultMode && (
        <>
          {/* These four cards should show only in default mode */}
          <OneObservationCard
            triggerCondition={numTotalObservations === 1}
            imageComponentOptions={{
              onImageComponentPress: handlePivotCardGridItemPress,
              accessibilityHint: t( "Navigates-to-observation-details" ),
              imageComponent: (
                <ObsGridItem
                  observation={observations[0]}
                  currentUser={currentUser}
                  explore={false}
                  queued={false}
                  testID="PivotCardGridItem"
                />
              )
            }}
          />
          <FiveObservationCard triggerCondition={numTotalObservations === 5} />
          <FiftyObservationCard
            triggerCondition={
              loggedInWhileInDefaultMode && !!currentUser && numTotalObservations >= 50
            }
          />
          <AccountCreationCard
            triggerCondition={
              justFinishedSignup && !!currentUser && numTotalObservations < 20
            }
          />
        </>
      )}
      <PerformanceDebugView
        showListMetrics
        showScrollMetrics
        position="bottom-left"
      />
    </>
  );
};

export default MyObservationsSimple;
