import { RealmContext } from "providers/contexts.ts";
import React, { useState } from "react";
import Realm from "realm";
import type { RealmObservation, RealmTaxon } from "realmModels/types";

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

  let numTotalTaxa: number | undefined;
  let leafTaxa: Realm.Results | Array<RealmTaxon> = [];
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
    numTotalTaxa = leafTaxonIds.length;

    // Get leaf taxa if we're viewing the species tab
    if ( activeTab === TAXA_TAB ) {
      // IDK how to placate TypeScript here. ~~~kueda 20250108
      leafTaxa = realm.objects( "Taxon" ).filtered( "id IN $0", leafTaxonIds );
    }
  }

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
      numTotalTaxa={numTotalTaxa}
      numTotalObservations={numTotalObservations}
      taxa={leafTaxa}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default MyObservationsSimpleContainer;
