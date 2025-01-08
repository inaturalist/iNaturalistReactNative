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
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback, useState } from "react";
import type {
  RealmObservation,
  RealmTaxon
  // RealmUser
} from "realmModels/types";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

const { useRealm } = RealmContext;

interface Props {
  // currentUser: RealmUser;
  handleIndividualUploadPress: ( uuid: string ) => void;
  handleSyncButtonPress: ( ) => void;
  handlePullToRefresh: ( ) => void;
  isConnected: boolean;
  isFetchingNextPage: boolean;
  layout: "list" | "grid";
  listRef?: React.RefObject<FlashList>;
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

const OBSERVATIONS_TAB = "observations";
const TAXA_TAB = "taxa";

const MyObservationsSimple = ( {
  // currentUser,
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

  // Calculate obs and leaf taxa counts from local observations
  const realm = useRealm();
  const numTotalObservations = realm.objects( "Observation" ).length;
  const distinctTaxonObs = realm.objects( "Observation" )
    .filtered( "taxon != null DISTINCT(taxon.id)" );
  const taxonIds = distinctTaxonObs.map( o => ( o.taxon as RealmTaxon ).id );
  const ancestorIds = distinctTaxonObs.map( o => (
    [...( o.taxon as RealmTaxon )?.ancestor_ids?.entries() || []]
  ) ).flat( Infinity );
  const leafTaxonIds = taxonIds.filter( taxonId => !ancestorIds.includes( taxonId ) );
  const numTotalTaxa = leafTaxonIds.length;

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
      <ViewWrapper>
        { numUnuploadedObservations > 0 && (
          <View className="bg-inatGreen p-2 items-center">
            <Body3 className="text-white">
              { t( "Upload-x-observations", { count: numUnuploadedObservations } ) }
            </Body3>
          </View>
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
          <ObservationsFlashList
            // dataCanBeFetched={!!currentUser}
            data={observations.filter( o => o.isValid() )}
            handlePullToRefresh={handlePullToRefresh}
            handleIndividualUploadPress={handleIndividualUploadPress}
            // onScroll={animatedScrollEvent}
            // hideLoadingWheel={!isFetchingNextPage || !currentUser}
            hideLoadingWheel
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
        ) }
        { activeTab === TAXA_TAB && (
          <Heading3>{ t( "Species" ) }</Heading3>
        ) }
        <ObservationsViewBar
          hideMap
          layout={layout}
          updateObservationsView={toggleLayout}
        />
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservationsSimple;
