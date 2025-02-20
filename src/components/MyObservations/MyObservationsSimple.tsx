import { useNavigation, useRoute } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  AccountCreationCard,
  FiftyObservationCard,
  FirstObservationCard,
  SecondObservationCard
} from "components/OnboardingModal/PivotCards.tsx";
import {
  Body1,
  Body3,
  Heading5,
  INatIcon,
  InfiniteScrollLoadingWheel,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import CustomFlashList from "components/SharedComponents/FlashList/CustomFlashList.tsx";
// import TaxonGridItem from "components/SharedComponents/TaxonGridItem.tsx";
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
import SimpleTaxonGridItem from "./SimpleTaxonGridItem";

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
  justFinishedSignup = false
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

  // If I define this interface outside of the component like a sane person
  // eslint has a mysterious fit. ~~~~kueda 20250108
  interface StatTabProps {
    id: string;
    text: string;
  }
  const StatTab = useCallback( ( { id, text: _text }: StatTabProps ) => {
    let stat: number | undefined;
    let label: string;
    if ( id === OBSERVATIONS_TAB ) {
      stat = numTotalObservations;
      label = t( "X-OBSERVATIONS--below-number", { count: numTotalObservations || 0 } );
    } else {
      stat = numTotalTaxa;
      label = t( "X-SPECIES--below-number", { count: numTotalTaxa || 0 } );
    }
    return (
      <View className="items-center p-3">
        <Body1 className="mb-[4px]">
          {
            typeof ( stat ) === "number"
              ? t( "Intl-number", { val: stat } )
              : "--"
          }
        </Body1>
        <Heading5>{ label }</Heading5>
      </View>
    );
  }, [t, numTotalObservations, numTotalTaxa] );

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

  const renderObservationsHeader = useCallback( ( ) => (
    <>
      { obsMissingBasicsExist && (
        <View className="flex-row items-center px-[32px] py-[20px]">
          <INatIcon
            name="triangle-exclamation"
            color={String( colors?.warningRed )}
            size={22}
          />
          <Body3 className="shrink ml-[20px]">
            { t( "Observations-need-location-date--warning" ) }
          </Body3>
        </View>
      ) }
      <Announcements isConnected={isConnected} />
    </>
  ), [
    isConnected,
    obsMissingBasicsExist,
    t
  ] );

  return (
    <>
      <ViewWrapper>
        <MyObservationsSimpleHeader
          currentUser={currentUser}
          isConnected={isConnected}
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
          TabComponent={StatTab}
        />
        { activeTab === OBSERVATIONS_TAB && (
          <>
            <ObservationsFlashList
              data={observations.filter( o => o.isValid() )}
              dataCanBeFetched={!!currentUser}
              handlePullToRefresh={handlePullToRefresh}
              handleIndividualUploadPress={handleIndividualUploadPress}
              hideLoadingWheel
              hideMetadata
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
              renderHeader={renderObservationsHeader}
            />
            <ObservationsViewBar
              hideMap
              layout={layout}
              updateObservationsView={toggleLayout}
            />
          </>
        ) }
        { activeTab === TAXA_TAB && (
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
        ) }
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
      {/* These four cards should show only in default mode */}
      <FirstObservationCard triggerCondition={numTotalObservations === 1} />
      <SecondObservationCard triggerCondition={numTotalObservations === 2} />
      <FiftyObservationCard triggerCondition={!!currentUser && numTotalObservations >= 50} />
      <AccountCreationCard
        triggerCondition={
          justFinishedSignup && !!currentUser && numTotalObservations < 20
        }
      />
    </>
  );
};

export default MyObservationsSimple;
