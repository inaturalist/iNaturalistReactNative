import { useNavigation, useRoute } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  AccountCreationCard,
  FiftyObservationCard,
  FiveObservationCard,
  OneObservationCard,
} from "components/OnboardingModal/PivotCards";
import {
  Body1,
  InfiniteScrollLoadingWheel,
  OfflineNotice,
  PerformanceDebugView,
  RadioButtonSheet,
  Tabs,
  ViewWrapper,
} from "components/SharedComponents";
import SortButton from "components/SharedComponents/Buttons/SortButton";
import CustomFlashList from "components/SharedComponents/FlashList/CustomFlashList";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import Photo from "realmModels/Photo";
import type {
  RealmObservation,
  RealmUser,
} from "realmModels/types";
import type { SPECIES_SORT } from "sharedHelpers/speciesSort";
import {
  MY_OBSERVATIONS_SPECIES_SORT_OPTIONS,
  useSpeciesSortLabels,
} from "sharedHelpers/speciesSort";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import { useGridLayout, useLayoutPrefs, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";
import type { SpeciesCount } from "types/sorting";

import LoginSheet from "./LoginSheet";
import { ACTIVE_SHEET } from "./MyObservationsContainer";
import MyObservationsSimpleHeader from "./MyObservationsSimpleHeader";
import PivotCardObsGridItem from "./PivotCardObsGridItem";
import SimpleHeader from "./SimpleHeader";
import SimpleTaxonGridItem from "./SimpleTaxonGridItem";
import StatTab from "./StatTab";

interface Props {
  activeTab: string;
  currentUser?: RealmUser;
  fetchFromLastObservation: ( id: number ) => void;
  handleIndividualUploadPress: ( uuid: string ) => void;
  handlePullToRefresh: ( ) => void;
  handleSyncButtonPress: ( ) => void;
  isConnected: boolean;
  isFetchingNextPage: boolean;
  layout: "list" | "grid";
  listRef?: React.RefObject<FlashListRef<RealmObservation> | null>;
  taxaListRef?: React.RefObject<FlashListRef<SpeciesCount> | null>;
  numTotalObservations?: number;
  numTotalTaxa?: number;
  numUnuploadedObservations: number;
  numObsMissingBasics: number;
  observations: { uuid: string }[];
  onEndReached: ( ) => void;
  onListLayout?: ( ) => void;
  onScroll?: ( ) => void;
  openSheet: ACTIVE_SHEET;
  setActiveTab: ( newTab: string ) => void;
  setOpenSheet: ( value: ACTIVE_SHEET ) => void;
  setSpeciesSortOptionId: ( value: SPECIES_SORT ) => void;
  showNoResults: boolean;
  speciesSortOptionId: SPECIES_SORT;
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

interface TaxaSortOption {
  label: string;
  text?: string;
  value: SPECIES_SORT;
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
  taxaListRef,
  numTotalTaxa,
  numUnuploadedObservations,
  numObsMissingBasics: numUnuploadedObsMissingBasics,
  observations,
  onEndReached,
  onListLayout,
  onScroll,
  openSheet,
  setActiveTab,
  setOpenSheet,
  setSpeciesSortOptionId,
  showNoResults,
  speciesSortOptionId,
  taxa,
  toggleLayout,
  fetchMoreTaxa,
  isFetchingTaxa,
  justFinishedSignup,
  loggedInWhileInDefaultMode = false,
  refetchTaxa,
}: Props ) => {
  const { isDefaultMode } = useLayoutPrefs( );
  const { t } = useTranslation( );
  const speciesSortLabels = useSpeciesSortLabels( );
  const navigation = useNavigation( );
  const route = useRoute( );
  const {
    flashListStyle,
    gridItemStyle,
    numColumns,
  } = useGridLayout( );
  const taxaFlashListStyle = useMemo( ( ) => ( {
    ...flashListStyle,
    paddingTop: 10,
  } ), [flashListStyle] );

  const taxaSortOptions = MY_OBSERVATIONS_SPECIES_SORT_OPTIONS.reduce(
    ( acc, sortBy ) => {
      const { label, text } = speciesSortLabels[sortBy];
      acc[sortBy] = {
        label,
        text,
        value: sortBy,
      };
      return acc;
    },
    {} as Record<SPECIES_SORT, TaxaSortOption>,
  );

  const renderTaxaItem = useCallback( ( { item: speciesCount }: TaxaFlashListRenderItemProps ) => {
    const taxonId = speciesCount.taxon.id;
    const navToTaxonDetails = ( ) => (
      // Again, not sure how to placate TypeScript w/ React Navigation
      navigation.navigate( {
        // Ensure button mashing doesn't open multiple TaxonDetails instances
        key: `${route.key}-TaxonGridItem-TaxonDetails-${taxonId}`,
        name: "TaxonDetails",
        params: { id: taxonId },
      } )
    );

    const accessibleName = accessibleTaxonName( speciesCount.taxon, currentUser, t );

    const source = {
      uri: Photo.displayLocalOrRemoteMediumPhoto(
        speciesCount.taxon?.default_photo,
      ),
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
    t,
  ] );

  const taxaFooterComponent = useMemo( ( ) => {
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
    taxa?.length,
  ] );

  const obsMissingBasicsExist = numUnuploadedObservations > 0 && numUnuploadedObsMissingBasics > 0;

  // if user is not logged in, we'll consider all obs 'uploadable' to shepherd people to login flow
  const numUploadableObservations = isDefaultMode && !!currentUser
    ? numUnuploadedObservations - numUnuploadedObsMissingBasics
    : numUnuploadedObservations;

  const renderTabComponent = ( { id }: { id: string } ) => (
    <StatTab
      id={id}
      numTotalObservations={numTotalObservations}
      numTotalTaxa={numTotalTaxa}
    />
  );

  const observationsHeader = useMemo( ( ) => {
    if ( layout !== "grid" ) {
      return (
        <SimpleHeader
          isConnected={isConnected}
          obsMissingBasicsExist={obsMissingBasicsExist}
          numTotalObservations={numTotalObservations}
        />
      );
    }

    const TARGET_SPACING = 10;

    // our HALF_GUTTER margin value is 7.5, so when we try to cancel it out around announcements we
    // can get odd rounding behavior that causes 1px margins. Using Math.ceil accounts for this.
    return (
      <View
        style={{
          marginTop: -Math.ceil( flashListStyle.paddingTop ),
          marginLeft: -Math.ceil( flashListStyle.paddingLeft ),
          marginRight: -Math.ceil( flashListStyle.paddingRight ),
          marginBottom: TARGET_SPACING - flashListStyle.paddingTop,
        }}
      >
        <SimpleHeader
          isConnected={isConnected}
          obsMissingBasicsExist={obsMissingBasicsExist}
          numTotalObservations={numTotalObservations}
        />
      </View>
    );
  }, [flashListStyle, isConnected, layout, numTotalObservations, obsMissingBasicsExist] );

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
        id: `empty-${index}`,
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

  function showOfflineAlert( ) {
    Alert.alert( t( "You-are-offline" ), t( "Please-try-again-when-you-are-online" ) );
  }

  const handleSortConfirm = ( optionId: SPECIES_SORT ) => {
    if ( currentUser && !isConnected ) {
      showOfflineAlert( );
      return;
    }
    setSpeciesSortOptionId( optionId );

    // scroll to the top of the newly sorted list
    // the timeout ensures that the scroll happens after data is re-sorted for logged-out users
    setTimeout( () => {
      if ( taxaListRef?.current ) {
        taxaListRef.current.scrollToOffset( { offset: 0, animated: true } );
      }
    }, 0 );

    setOpenSheet( ACTIVE_SHEET.NONE );
  };

  const handlePivotCardGridItemPress = ( ) => {
    const { uuid } = observations[0];
    navigation.navigate( {
      key: `Obs-0-${uuid}`,
      name: "ObsDetails",
      params: { uuid },
    } );
  };

  return (
    <>
      <ViewWrapper>
        <MyObservationsSimpleHeader
          currentUser={currentUser}
          isConnected={isConnected}
          numUploadableObservations={numUploadableObservations}
          handleSyncButtonPress={handleSyncButtonPress}
        />
        <Tabs
          activeColor={String( colors?.inatGreen )}
          activeId={activeTab}
          tabs={[
            {
              id: OBSERVATIONS_TAB,
              text: t( "Observations" ),
              onPress: () => setActiveTab( OBSERVATIONS_TAB ),
            },
            {
              id: TAXA_TAB,
              text: t( "Species" ),
              onPress: () => setActiveTab( TAXA_TAB ),
            },
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
              listHeaderContent={observationsHeader}
            />
            <ObservationsViewBar
              hideMap
              layout={layout}
              updateObservationsView={toggleLayout}
            />
            {/* <SortButton
              onPress={() => setOpenSheet( ACTIVE_SHEET.SORT )}
              accessibilityLabel={t( "Change-observations-sort-order" )}
            /> */}
          </>
        ) }
        { ( activeTab === TAXA_TAB && taxa.length > 0 ) && (
          <>
            <CustomFlashList
              ref={taxaListRef}
              canFetch={!!currentUser}
              contentContainerStyle={taxaFlashListStyle}
              data={taxa}
              hideLoadingWheel
              isConnected={isConnected}
              keyExtractor={(
                item: SpeciesCount,
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
              ListFooterComponent={taxaFooterComponent}
            />
            <SortButton
              onPress={() => setOpenSheet( ACTIVE_SHEET.SORT )}
              accessibilityLabel={t( "Change-species-sort-order" )}
            />
          </>
        )}
        { ( activeTab === TAXA_TAB && taxa.length === 0 ) && renderOfflineNotice( )}
      </ViewWrapper>
      {openSheet === ACTIVE_SHEET.SORT && (
        <RadioButtonSheet
          headerText={t( "SORT-SPECIES" )}
          radioValues={taxaSortOptions}
          selectedValue={speciesSortOptionId}
          confirm={optionId => handleSortConfirm( optionId as SPECIES_SORT )}
          onPressClose={() => setOpenSheet( ACTIVE_SHEET.NONE )}
        />
      )}
      {openSheet === ACTIVE_SHEET.LOGIN && <LoginSheet setShowLoginSheet={setOpenSheet} />}
      {isDefaultMode && (
        <>
          {/* These four cards should show only in default mode */}
          <OneObservationCard
            triggerCondition={numTotalObservations === 1}
            imageComponentOptions={{
              onImageComponentPress: handlePivotCardGridItemPress,
              accessibilityHint: t( "Navigates-to-observation-details" ),
              imageComponent: (
                <PivotCardObsGridItem
                  uuid={observations[0].uuid}
                />
              ),
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
