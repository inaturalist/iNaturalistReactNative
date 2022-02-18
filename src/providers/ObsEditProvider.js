// @flow
import React, { useState, useEffect } from "react";
import type { Node } from "react";

import { ObsEditContext } from "./contexts";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const [obsToEdit, setObsToEdit] = useState( [] );
  const [currentObservation, setCurrentObservation] = useState( 0 );

  const addSound = ( sound ) => {
    const updatedObs = Array.from( obsToEdit );
    if ( !obsToEdit[currentObservation] ) {
      updatedObs.push( { observationSounds: sound } );
      setObsToEdit( updatedObs );
    }

    if ( obsToEdit[currentObservation]
      && !obsToEdit[currentObservation].observationSounds ) {
        updatedObs[currentObservation].observationSounds = sound;
        setObsToEdit( updatedObs );
    }
  };

  const addPhotos = ( photos ) => {
    // but only if less than 10 per observation? or whatever number we choose
    const updatedObs = Array.from( obsToEdit );
    if ( !obsToEdit[currentObservation] ) {
      updatedObs.push( { observationPhotos: photos } );
      setObsToEdit( updatedObs );
    } else if ( obsToEdit[currentObservation]
      && !obsToEdit[currentObservation].observationPhotos ) {
        updatedObs[currentObservation].observationPhotos = photos;
        setObsToEdit( updatedObs );
    } else if ( obsToEdit[currentObservation].observationPhotos ) {
      updatedObs[currentObservation].observationPhotos.concat( photos );
    }
  };

  console.log( obsToEdit, "obs edit provider" );

  const obsEditValue = {
    obsToEdit,
    currentObservation,
    setCurrentObservation,
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
