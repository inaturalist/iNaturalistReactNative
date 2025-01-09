import { FlashList } from "@shopify/flash-list";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import {
  Body1,
  Body3,
  Heading3,
  Heading5,
  RotatingINatIconButton,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import CustomFlashList from "components/SharedComponents/FlashList/CustomFlashList.tsx";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem.tsx";
import { Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback, useMemo, useState } from "react";
import Realm from "realm";
import type {
  RealmObservation,
  RealmTaxon
} from "realmModels/types";
import { useGridLayout, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

const { useRealm } = RealmContext;

interface Props {
  handleIndividualUploadPress: ( uuid: string ) => void;
  handleSyncButtonPress: ( ) => void;
  handlePullToRefresh: ( ) => void;
  isConnected: boolean;
  isFetchingNextPage: boolean;
  layout: "list" | "grid";
  listRef?: React.RefObject<FlashList<RealmObservation>>;
  numUnuploadedObservations: number;
  observations: RealmObservation[];
  onEndReached: ( ) => void;
  onListLayout?: ( ) => void;
  onScroll?: ( ) => void;
  setShowLoginSheet: ( newValue: boolean ) => void;
  showLoginSheet: boolean;
  showNoResults: boolean;
  toggleLayout: ( ) => void;
}

interface TaxaFlashListRenderItemProps {
  // I'm pretty sure this is some kind of bug ~~~~kueda 20250108
  // eslint-disable-next-line react/no-unused-prop-types
  item: RealmTaxon;
}

const OBSERVATIONS_TAB = "observations";
const TAXA_TAB = "taxa";

const MyObservationsSimple = ( {
  handleIndividualUploadPress,
  handleSyncButtonPress,
  handlePullToRefresh,
  isConnected,
  isFetchingNextPage,
  layout,
  listRef,
  numUnuploadedObservations,
  observations,
  onEndReached,
  onListLayout,
  onScroll: _onScroll,
  setShowLoginSheet,
  showLoginSheet,
  showNoResults,
  toggleLayout
}: Props ) => {
  const { t } = useTranslation( );
  const [activeTab, setActiveTab] = useState( OBSERVATIONS_TAB );
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

  // Calculate obs and leaf taxa counts from local observations
  const realm = useRealm();
  const numTotalObservations = realm.objects( "Observation" ).length;
  const distinctTaxonObs = realm.objects( "Observation" )
    .filtered( "taxon != null DISTINCT(taxon.id)" );
  const taxonIds = distinctTaxonObs.map( o => ( o.taxon as RealmTaxon ).id );
  const ancestorIds = distinctTaxonObs.map( o => {
    // We're filtering b/c for taxa above species level, the taxon's own
    // ID is included in ancestor ids for some reason (this is a bug...
    // somewhere)
    const taxonAncestorIds = (
      ( o.taxon as RealmTaxon )?.ancestor_ids || []
    ).filter( id => Number( id ) !== Number( o.taxon?.id ) );
    return taxonAncestorIds;
  } ).flat( Infinity );
  const leafTaxonIds = taxonIds.filter( taxonId => !ancestorIds.includes( taxonId ) );
  const numTotalTaxa = leafTaxonIds.length;

  // Get leaf taxa if we're viewing the species tab
  let leafTaxa: Realm.Results | Array<RealmTaxon> = [];
  if ( activeTab === TAXA_TAB ) {
    // IDK how to placate TypeScript here. ~~~kueda 20240108
    leafTaxa = realm.objects( "Taxon" ).filtered( "id IN $0", leafTaxonIds );
  }

  // If I define this interface outside of the component like a sane person
  // eslint has a mysterious fit. ~~~~kueda 20250108
  interface StatTabProps {
    id: string;
    text: string;
  }
  const StatTab = useCallback( ( { id, text: _text }: StatTabProps ) => {
    let stat: number;
    let label: string;
    if ( id === OBSERVATIONS_TAB ) {
      stat = numTotalObservations;
      label = t( "X-OBSERVATIONS--below-number", { count: numTotalObservations } );
    } else {
      stat = numTotalTaxa;
      label = t( "X-SPECIES--below-number", { count: numTotalTaxa } );
    }
    return (
      <View className="items-center p-3">
        <Body1 className="mb-[4px]">{ t( "Intl-number", { val: stat } ) }</Body1>
        <Heading5>{ label }</Heading5>
      </View>
    );
  }, [t, numTotalObservations, numTotalTaxa] );

  return (
    <>
      <ViewWrapper isDebug>
        { numUnuploadedObservations > 0 && (
          <Pressable
            accessibilityRole="button"
            className="bg-inatGreen p-2 items-center"
            onPress={handleSyncButtonPress}
          >
            <Body3 className="text-white">
              { t( "Upload-x-observations", { count: numUnuploadedObservations } ) }
            </Body3>
          </Pressable>
        ) }
        <View className="flex-row justify-between items-center px-5 py-1">
          <Heading3>{ t( "My-Observations" ) }</Heading3>
          <RotatingINatIconButton
            icon={
              numUnuploadedObservations > 0
                ? "sync-unsynced"
                : "sync"
            }
            onPress={handleSyncButtonPress}
            color={String(
              numUnuploadedObservations > 0
                ? colors?.inatGreen
                : colors?.darkGray
            )}
            accessibilityLabel={t( "Sync-observations" )}
            size={26}
            testID="SyncButton"
          />
        </View>
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
              ref={listRef}
              showObservationsEmptyScreen
              showNoResults={showNoResults}
              testID="MyObservationsAnimatedList"
              renderHeader={(
                <Announcements isConnected={isConnected} />
              )}
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
            canFetch={false}
            contentContainerStyle={taxaFlashListStyle}
            data={leafTaxa}
            estimatedItemSize={estimatedGridItemSize}
            hideLoadingWheel
            isConnected={false}
            keyExtractor={( item: RealmTaxon ) => item.id}
            layout="grid"
            numColumns={numColumns}
            renderItem={( { item }: TaxaFlashListRenderItemProps ) => item && (
              <TaxonGridItem
                style={gridItemStyle}
                taxon={item}
              />
            )}
            totalResults={leafTaxa.length}
            testID="ExploreSpeciesAnimatedList"
          />
        ) }
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservationsSimple;
