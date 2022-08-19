// @flow
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import Realm from "realm";

import realmConfig from "../models/index";
import Observation from "../models/Observation";
import ObservationPhoto from "../models/ObservationPhoto";
import { ObsEditContext } from "./contexts";
import saveLocalObservation from "./uploadHelpers/saveLocalObservation";
import uploadObservation from "./uploadHelpers/uploadObservation";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const [currentObsIndex, setCurrentObsIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );

  const currentObs = observations[currentObsIndex];

  const addSound = async ( ) => {
    const newObs = await Observation.createObsWithSounds( );
    setObservations( [newObs] );
  };

  const addPhotos = async photos => {
    const realm = await Realm.open( realmConfig );
    const obsPhotos = await Promise.all( photos.map(
      async photo => ObservationPhoto.new( photo, realm )
    ) );
    const newObs = await Observation.createObsWithPhotos( obsPhotos );
    setObservations( [newObs] );
  };

  const addObservations = async obs => setObservations( obs );

  const addObservationNoEvidence = async ( ) => {
    const newObs = await Observation.new( );
    setObservations( [newObs] );
  };

  const obsEditValue = useMemo( ( ) => {
    const updateObservationKey = ( key, value ) => {
      const updatedObs = observations.map( ( obs, index ) => {
        if ( index === currentObsIndex ) {
          return {
            ...obs,
            // $FlowFixMe
            [key]: value
          };
        }
        return obs;
      } );
      setObservations( updatedObs );
    };

    const updateTaxon = taxon => {
      updateObservationKey( "taxon", taxon );
      navigation.navigate( "ObsEdit" );
    };

    const setNextScreen = ( ) => {
      if ( observations.length === 1 ) {
        setCurrentObsIndex( 0 );
        setObservations( [] );

        navigation.navigate( "ObsList" );
      } else if ( currentObsIndex === observations.length - 1 ) {
        observations.pop( );
        setCurrentObsIndex( observations.length - 1 );
        setObservations( observations );
      } else {
        observations.splice( currentObsIndex, 1 );
        setCurrentObsIndex( currentObsIndex );
        // this seems necessary for rerendering the ObsEdit screen
        setObservations( [] );
        setObservations( observations );
      }
    };

    const openSavedObservation = async savedUUID => {
      const realm = await Realm.open( realmConfig );
      const obs = realm.objectForPrimaryKey( "Observation", savedUUID );
      const plainObject = obs.toJSON( );
      setObservations( [plainObject] );
      return obs;
    };

    const deleteCurrentObservation = ( ) => {
      if ( currentObsIndex === observations.length - 1 ) {
        setCurrentObsIndex( currentObsIndex - 1 );
      }
      observations.splice( currentObsIndex, 1 );
      setObservations( observations );

      if ( observations.length === 0 ) {
        navigation.navigate( "ObsList" );
      }
    };

    const saveObservation = async ( ) => {
      const localObs = await saveLocalObservation( currentObs );
      if ( localObs ) {
        setNextScreen( );
      }
    };

    const saveAndUploadObservation = async ( ) => {
      const localObs = await saveLocalObservation( currentObs );
      uploadObservation( localObs );
      if ( localObs ) {
        setNextScreen( );
      }
    };

    return {
      addObservationNoEvidence,
      addObservations,
      addPhotos,
      addSound,
      currentObsIndex,
      deleteCurrentObservation,
      observations,
      openSavedObservation,
      saveAndUploadObservation,
      saveObservation,
      setCurrentObsIndex,
      setObservations,
      updateObservationKey,
      updateTaxon
    };
  }, [
    currentObs,
    currentObsIndex,
    navigation,
    observations
  ] );

  return (
    <ObsEditContext.Provider value={obsEditValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
