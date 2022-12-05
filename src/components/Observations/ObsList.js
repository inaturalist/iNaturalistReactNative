// @flow

import { fetchObservationUpdates, searchObservations } from "api/observations";
import ObservationViews from "components/Observations/ObservationViews";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useLocalObservations from "sharedHooks/useLocalObservations";

const { useRealm } = RealmContext;

const ObsList = ( ): Node => {
  const realm = useRealm( );
  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0];
  const [idBelow, setIdBelow] = useState( null );
  const localObservations = useLocalObservations( );

  const updateParams = {
    observations_by: "owner",
    per_page: 100,
    viewed: false,
    fields: "viewed,resource_uuid"
  };

  const {
    data: updates
  } = useAuthenticatedQuery(
    ["fetchObservationUpdates"],
    optsWithAuth => fetchObservationUpdates( updateParams, optsWithAuth )
  );

  const params = {
    user_id: currentUser?.id,
    per_page: 10,
    fields: Observation.FIELDS
  };

  if ( idBelow ) {
    // $FlowIgnore
    params.id_below = idBelow;
  } else {
    // $FlowIgnore
    params.page = 1;
  }

  const {
    data: observations,
    isLoading
  } = useAuthenticatedQuery(
    ["searchObservations", idBelow],
    optsWithAuth => searchObservations( params, optsWithAuth ),
    {
      keepPreviousData: true
    }
  );

  const handleEndReached = oldestId => setIdBelow( oldestId );

  useEffect( ( ) => {
    if ( observations ) {
      Observation.updateLocalObservationsFromRemote( realm, observations );
    }
  }, [realm, observations] );

  useEffect( ( ) => {
    if ( !updates ) { return; }
    updates.forEach( update => {
      const existingObs = realm?.objectForPrimaryKey( "Observation", update.resource_uuid );
      if ( !existingObs ) { return; }
      realm?.write( ( ) => {
        existingObs.viewed = update.viewed;
      } );
    } );
  }, [realm, updates] );

  return (
    <ViewWithFooter>
      <ObservationViews
        loading={isLoading}
        localObservations={localObservations}
        testID="ObsList.myObservations"
        handleEndReached={handleEndReached}
      />
    </ViewWithFooter>
  );
};

export default ObsList;
