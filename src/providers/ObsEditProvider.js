// @flow
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useApiToken from "sharedHooks/useApiToken";

import { ObsEditContext, RealmContext } from "./contexts";
import uploadObservation from "./uploadHelpers/uploadObservation";

const { useRealm } = RealmContext;

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const [currentObsIndex, setCurrentObsIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );
  const realm = useRealm( );
  const apiToken = useApiToken( );

  const currentObs = observations[currentObsIndex];

  const addSound = async ( ) => {
    const newObs = await Observation.createObsWithSounds( );
    setObservations( [newObs] );
  };

  const addObservations = async obs => setObservations( obs );

  const addObservationNoEvidence = async ( ) => {
    const newObs = await Observation.new( );
    setObservations( [newObs] );
  };

  const obsEditValue = useMemo( ( ) => {
    const addPhotos = async photoUris => {
      const obsPhotos = await Promise.all( photoUris.map(
        async photo => ObservationPhoto.new( photo, realm )
      ) );
      let targetObservation = currentObs;
      if ( targetObservation ) {
        targetObservation = {
          ...(
            targetObservation.toJSON
              ? targetObservation.toJSON( )
              : targetObservation
          ),
          observationPhotos: [
            ...Array.from( targetObservation.observationPhotos ),
            ...obsPhotos
          ]
        };
      } else {
        targetObservation = await Observation.createObsWithPhotos( obsPhotos );
      }
      setObservations( [targetObservation] );
    };

    const updateObservationKey = ( key, value ) => {
      const updatedObservations = observations.map( ( obs, index ) => {
        if ( index === currentObsIndex ) {
          return {
            ...( obs.toJSON ? obs.toJSON( ) : obs ),
            // $FlowFixMe
            [key]: value
          };
        }
        return obs;
      } );
      setObservations( updatedObservations );
    };

    const updateObservationKeys = keysAndValues => {
      const updatedObservations = observations.map( ( obs, index ) => {
        if ( index === currentObsIndex ) {
          const updatedObservation = {
            ...( obs.toJSON ? obs.toJSON( ) : obs ),
            ...keysAndValues
          };
          return updatedObservation;
        }
        return obs;
      } );
      setObservations( updatedObservations );
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
      const obs = realm.objectForPrimaryKey( "Observation", savedUUID );
      setObservations( [obs] );
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
      const localObs = await Observation.saveLocalObservationForUpload( currentObs, realm );
      if ( localObs ) {
        setNextScreen( );
      }
    };

    const saveAndUploadObservation = async ( ) => {
      const localObs = await Observation.saveLocalObservationForUpload( currentObs, realm );
      if ( !realm ) {
        throw new Error( "Gack, tried to save an observation without realm!" );
      }
      if ( !apiToken ) {
        throw new Error( "Gack, tried to save an observation without API token!" );
      }
      uploadObservation( localObs, realm, apiToken );
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
      updateObservationKeys,
      updateTaxon
    };
  }, [
    currentObs,
    currentObsIndex,
    navigation,
    observations,
    realm,
    apiToken
  ] );

  return (
    <ObsEditContext.Provider value={obsEditValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
