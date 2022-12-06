// @flow

import { fetchObservationUpdates } from "api/observations";
import ObservationViews from "components/Observations/ObservationViews";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect } from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

const { useRealm } = RealmContext;

const ObsList = ( ): Node => {
  const realm = useRealm( );

  const updateParams = {
    observations_by: "owner",
    per_page: 100,
    viewed: false,
    fields: "viewed,resource_uuid"
  };

  // TODO: does this make more sense to put in an App.js component?
  const {
    data: updates
  } = useAuthenticatedQuery(
    ["fetchObservationUpdates"],
    optsWithAuth => fetchObservationUpdates( updateParams, optsWithAuth )
  );

  console.log( updates, "updates in api call" );

  useEffect( ( ) => {
    if ( !updates ) { return; }
    updates.forEach( update => {
      console.log( update.viewed, "viewed from api call" );
      const existingObs = realm?.objectForPrimaryKey( "Observation", update.resource_uuid );
      if ( !existingObs ) { return; }
      realm?.write( ( ) => {
        existingObs.viewed = update.viewed;
      } );
    } );
  }, [realm, updates] );

  return (
    <ViewWithFooter>
      <ObservationViews />
    </ViewWithFooter>
  );
};

export default ObsList;
