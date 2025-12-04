// @flow
import _ from "lodash";
import type { Node } from "react";
import React, { useMemo } from "react";

import ObsMediaDisplay from "./ObsMediaDisplay";

type Props = {
  observation: Object,
  tablet?: boolean
};

// TODO replace this hack. Without this you get errors about the
// photo objects being invalidated down in ObsMedia, but the
// questions remains, why are these objects getting invalidated in
// the first place? We are not deleting them, so what's happening
// to them and why?
function jsonifyPotentialRealmObjects( objects ) {
  return _.compact(
    Array.from( objects || [] ).map(
      object => (
        object.toJSON
          ? object.toJSON( )
          : object
      )
    )
  );
}

const ObsMediaDisplayContainer = ( {
  observation,
  tablet = false
}: Props ): Node => {
  const photos = useMemo( ( ) => jsonifyPotentialRealmObjects(
    (
      observation?.observationPhotos
      || observation?.observation_photos
      || []
    ).map( op => op.photo )
  ), [observation] );
  const sounds = useMemo(
    ( ) => jsonifyPotentialRealmObjects(
      (
        observation?.observationSounds
        || observation?.observation_sounds
        || []
      ).map( os => os.sound )
    ),
    [observation]
  );

  return (
    <ObsMediaDisplay
      loading={!observation}
      photos={photos}
      sounds={sounds}
      tablet={tablet}
    />
  );
};

export default ObsMediaDisplayContainer;
