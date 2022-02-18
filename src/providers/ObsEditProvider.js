// @flow
import React, { useState, useEffect } from "react";
import type { Node } from "react";

import { ObsEditContext } from "./contexts";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const [obsToEdit, setObsToEdit] = useState( [] );
  const [currentObsNumber, setCurrentObsNumber] = useState( 0 );

  const currentObs = obsToEdit[currentObsNumber];

  const addSound = ( sound ) => {
    const updatedObs = Array.from( obsToEdit );
    if ( !currentObs ) {
      updatedObs.push( { observationSounds: sound } );
      setObsToEdit( updatedObs );
    }

    if ( currentObs && !currentObs.observationSounds ) {
      updatedObs[currentObsNumber].observationSounds = sound;
      setObsToEdit( updatedObs );
    }
  };

  const addPhotos = ( photos ) => {
    // but only if less than 10 per observation? or whatever number we choose
    const updatedObs = Array.from( obsToEdit );
    if ( !currentObs ) {
      updatedObs.push( { observationPhotos: photos } );
      setObsToEdit( updatedObs );
    } else if ( currentObs && !currentObs.observationPhotos ) {
      updatedObs[currentObsNumber].observationPhotos = photos;
      setObsToEdit( updatedObs );
    } else if ( currentObs.observationPhotos ) {
      updatedObs[currentObsNumber].observationPhotos.concat( photos );
    }
  };

  console.log( obsToEdit, "obs edit provider" );

  const obsEditValue = {
    obsToEdit,
    currentObsNumber,
    setCurrentObsNumber,
    addSound,
    addPhotos
  };

  return (
    <ObsEditContext.Provider value={obsEditValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
