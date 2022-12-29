// @flow

import { fetchObservationUpdates } from "api/observations";
import ObservationViews from "components/Observations/ObservationViews";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect } from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

const { useRealm } = RealmContext;

const ObsList = ( ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const updateParams = {
    // TODO: viewed = false is a param in the API v2 docs
    // but it's currently not returning any results
    // so filtering in useEffect instead
    observations_by: "owner",
    per_page: 100,
    fields: "viewed,resource_uuid"
  };

  // TODO: does this make more sense to put in an App.js component?
  const {
    data: updates
  } = useAuthenticatedQuery(
    ["fetchObservationUpdates"],
    optsWithAuth => fetchObservationUpdates( updateParams, optsWithAuth ),
    {},
    { enabled: !!currentUser }
  );

  useEffect( ( ) => {
    if ( !updates ) { return; }
    const unviewed = updates.filter( result => result.viewed === false ).map( r => r );
    unviewed.forEach( update => {
      const existingObs = realm?.objectForPrimaryKey( "Observation", update.resource_uuid );
      if ( !existingObs ) { return; }
      realm?.write( ( ) => {
        existingObs.viewed = update.viewed;
      } );
    } );
  }, [realm, updates] );

  return <ObservationViews />;
};

export default ObsList;
