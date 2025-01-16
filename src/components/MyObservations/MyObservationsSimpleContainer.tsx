import { RealmContext } from "providers/contexts.ts";
import React, { useState } from "react";
import Realm from "realm";
import type { RealmTaxon } from "realmModels/types";

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
    // IDK how to placate TypeScript here. ~~~kueda 20250108
    leafTaxa = realm.objects( "Taxon" ).filtered( "id IN $0", leafTaxonIds );
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
