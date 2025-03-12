import { fetchSpeciesCounts } from "api/observations";
import { RealmContext } from "providers/contexts.ts";
import React, { useEffect, useState } from "react";
import Taxon from "realmModels/Taxon";
import type { RealmObservation, RealmTaxon } from "realmModels/types";
import { useInfiniteScroll } from "sharedHooks";
import { zustandStorage } from "stores/useStore";

import MyObservationsSimple, {
  OBSERVATIONS_TAB,
  Props,
  TAXA_TAB
} from "./MyObservationsSimple";

const { useRealm } = RealmContext;

interface SpeciesCount {
  count: number,
  taxon: RealmTaxon
  }

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
  toggleLayout,
  justFinishedSignup
}: Props ) => {
  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );
  const numOfUserSpecies = zustandStorage.getItem( "numOfUserSpecies" );
  const [activeTab, setActiveTab] = useState( OBSERVATIONS_TAB );
  const realm = useRealm();

  let numTotalTaxaLocal: number | undefined;
  const localObservedSpeciesCount: Array<SpeciesCount> = [];
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
      const localObs = realm.objects( "Observation" ).filtered( "taxon.id IN $0", leafTaxonIds );
      leafTaxonIds.forEach( id => {
        const obs = localObs.filter( o => o.taxon.id === id );
        localObservedSpeciesCount.push( { count: obs.length, taxon: obs[0].taxon } );
      } );
    }
  }

  const {
    data: remoteObservedTaxaCounts,
    isFetchingNextPage: isFetchingTaxa,
    fetchNextPage: fetchMoreTaxa,
    totalResults: numTotalTaxaRemote,
    refetch: refetchTaxa
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

  const numTotalTaxa = typeof ( numTotalTaxaRemote ) === "number"
    ? numTotalTaxaRemote
    : numTotalTaxaLocal;

  useEffect( ( ) => {
    // persist this number in zustand so a user can see their latest observations count
    // even if they're offline
    if ( numTotalObservations > numOfUserObservations ) {
      zustandStorage.setItem( "numOfUserObservations", numTotalObservations );
    }
  }, [numTotalObservations, numOfUserObservations] );

  useEffect( ( ) => {
    // persist this number in zustand so a user can see their latest species count
    // even if they're offline
    if ( numTotalTaxa > numOfUserSpecies ) {
      zustandStorage.setItem( "numOfUserSpecies", numTotalTaxa );
    }
  }, [numTotalTaxa, numOfUserSpecies] );

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
      numTotalTaxa={numOfUserSpecies}
      numTotalObservations={numOfUserObservations}
      taxa={
        currentUser
          ? remoteObservedTaxaCounts
          : localObservedSpeciesCount
      }
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      fetchMoreTaxa={fetchMoreTaxa}
      isFetchingTaxa={isFetchingTaxa}
      justFinishedSignup={justFinishedSignup}
      refetchTaxa={refetchTaxa}
    />
  );
};

export default MyObservationsSimpleContainer;
