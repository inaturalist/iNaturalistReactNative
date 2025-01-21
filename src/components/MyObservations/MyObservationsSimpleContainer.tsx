import { fetchSpeciesCounts } from "api/observations";
import { RealmContext } from "providers/contexts.ts";
import React, { useState } from "react";
import Realm from "realm";
import Taxon from "realmModels/Taxon";
import type { RealmObservation, RealmTaxon } from "realmModels/types";
import { useInfiniteScroll } from "sharedHooks";

import MyObservationsSimple, {
  OBSERVATIONS_TAB,
  Props,
  TAXA_TAB
} from "./MyObservationsSimple";

const { useRealm } = RealmContext;

const MyObservationsSimpleContainer = ( {
  currentUser,
  handleIndividualUploadPress,
  handleSyncButtonPress,
  handlePullToRefresh,
  isConnected,
  isFetchingNextPage,
  layout,
  listRef,
  numTotalObservations,
  numUnuploadedObservations,
  observations,
  onEndReached,
  onListLayout,
  onScroll,
  setShowLoginSheet,
  showLoginSheet,
  showNoResults,
  toggleLayout
}: Props ) => {
  const [activeTab, setActiveTab] = useState( OBSERVATIONS_TAB );
  const realm = useRealm();

  let numTotalTaxaLocal: number | undefined;
  let localObservedTaxa: Realm.Results | Array<RealmTaxon> = [];
  if ( !currentUser ) {
    // Calculate obs and leaf taxa counts from local observations
    const distinctTaxonObs = realm.objects<RealmObservation>( "Observation" )
      .filtered( "taxon != null DISTINCT(taxon.id)" );
    const taxonIds: number[] = distinctTaxonObs
      .map( o => o.taxon?.id || 0 )
      .filter( Boolean );
    const ancestorIds = distinctTaxonObs.map( o => {
      // We're filtering b/c for taxa above species level, the taxon's own
      // ID is included in ancestor ids for some reason (this is a bug...
      // somewhere)
      const taxonAncestorIds = (
        o.taxon?.ancestor_ids || []
      ).filter( id => Number( id ) !== Number( o.taxon?.id ) );
      return taxonAncestorIds;
    } ).flat( Infinity );
    const leafTaxonIds = taxonIds.filter( taxonId => !ancestorIds.includes( taxonId ) );
    numTotalTaxaLocal = leafTaxonIds.length;

    // Get leaf taxa if we're viewing the species tab
    if ( activeTab === TAXA_TAB ) {
      // IDK how to placate TypeScript here. ~~~kueda 20250108
      localObservedTaxa = realm.objects( "Taxon" ).filtered( "id IN $0", leafTaxonIds );
    }
  }

  const {
    data: remoteObservedTaxaCounts,
    isFetchingNextPage: isFetchingTaxa,
    fetchNextPage: fetchMoreTaxa,
    totalResults: numTotalTaxaRemote
  } = useInfiniteScroll(
    "MyObsSimple-fetchSpeciesCounts",
    fetchSpeciesCounts,
    {
      user_id: currentUser?.id,
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS
      }
    },
    {
      enabled: !!currentUser
    }
  );

  return (
    <MyObservationsSimple
      currentUser={currentUser}
      isFetchingNextPage={isFetchingNextPage}
      isConnected={isConnected}
      handleIndividualUploadPress={handleIndividualUploadPress}
      handleSyncButtonPress={handleSyncButtonPress}
      handlePullToRefresh={handlePullToRefresh}
      layout={layout}
      listRef={listRef}
      numUnuploadedObservations={numUnuploadedObservations}
      observations={observations}
      onEndReached={onEndReached}
      onListLayout={onListLayout}
      onScroll={onScroll}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      showNoResults={showNoResults}
      toggleLayout={toggleLayout}
      numTotalTaxa={
        typeof ( numTotalTaxaRemote ) === "number"
          ? numTotalTaxaRemote
          : numTotalTaxaLocal
      }
      numTotalObservations={numTotalObservations}
      taxa={
        currentUser
          ? remoteObservedTaxaCounts.map( tc => Taxon.mapApiToRealm( tc.taxon ) )
          : localObservedTaxa
      }
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      fetchMoreTaxa={fetchMoreTaxa}
      isFetchingTaxa={isFetchingTaxa}
    />
  );
};

export default MyObservationsSimpleContainer;
