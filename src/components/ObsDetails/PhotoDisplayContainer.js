// @flow
import _ from "lodash";
import type { Node } from "react";
import React, { useMemo } from "react";

import PhotoDisplay from "./PhotoDisplay";

type Props = {
  observation: Object,
  isOnline: boolean
}

const PhotoDisplayContainer = ( {
  observation,
  isOnline
}: Props ): Node => {
  const photos = useMemo(
    ( ) => _.compact(
      Array.from(
        observation?.observationPhotos || observation?.observation_photos || []
      ).map(
        // TODO replace this hack. Without this you get errors about the
        // photo objects being invalidated down in PhotoScroll, but the
        // questions remains, why are these objects getting invalidated in
        // the first place? We are not deleting them, so what's happening
        // to them and why?
        op => (
          op.photo.toJSON
            ? op.photo.toJSON( )
            : op.photo
        )
      )
    ),
    [observation]
  );

  return (
    <PhotoDisplay
      photos={photos}
      isOnline={isOnline}
    />
  );
};

export default PhotoDisplayContainer;
