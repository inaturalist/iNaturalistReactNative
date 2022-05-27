// @flow
import React, { useState, useContext } from "react";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";
import Realm from "realm";

import { ObsEditContext } from "./contexts";
import realmConfig from "../models/index";
import saveLocalObservation from "./uploadHelpers/saveLocalObservation";
import uploadObservation from "./uploadHelpers/uploadObservation";
import Observation from "../models/Observation";
import { PhotoGalleryContext } from "./contexts";
import ObservationPhoto from "../models/ObservationPhoto";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const { setSelectedPhotos } = useContext( PhotoGalleryContext );
  const navigation = useNavigation( );
  const [currentObsIndex, setCurrentObsIndex] = useState( 0 );
  const [observations, setObservations] = useState( [] );

  const currentObs = observations[currentObsIndex];

  const addSound = async ( ) => {
    const newObs = await Observation.createObsWithSounds( );
    setObservations( [newObs] );
  };

  const addPhotos = async ( photos ) => {
    const realm = await Realm.open( realmConfig );
    const obsPhotos = await Promise.all( photos.map( async photo => {
      return await ObservationPhoto.new( photo, realm );
    } ) );
    const newObs = await Observation.createObsWithPhotos( obsPhotos );
    setObservations( [newObs] );
  };

  const addObservations = async ( obs ) => setObservations( obs );

  const addObservationNoEvidence = async ( ) => {
    const newObs = await Observation.new( );
    setObservations( [newObs] );
  };

  const updateObservationKey = ( key, value ) => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObsIndex ) {
        return {
          ...obs,
          // $FlowFixMe
          [key]: value
        };
      } else {
        return obs;
      }
    } );
    setObservations( updatedObs );
  };

  const updateTaxon = ( taxon ) => {
    updateObservationKey( "taxon", taxon );
    navigation.navigate( "ObsEdit" );
  };

  const setNextScreen = ( ) => {
    if ( observations.length === 1 ) {
      setCurrentObsIndex( 0 );
      setObservations( [] );
      setSelectedPhotos( {} );

      navigation.navigate( "my observations", {
        screen: "ObsList",
        params: { savedLocalData: true }
      } );
    } else {
      if ( currentObsIndex === observations.length - 1 ) {
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
    const mappedObs = Observation.mapObservationForUpload( localObs );
    uploadObservation( mappedObs, localObs );
    if ( localObs ) {
      setNextScreen( );
    }
  };

  const openSavedObservation = async ( savedUUID ) => {
    const realm = await Realm.open( realmConfig );
    const obs = realm.objectForPrimaryKey( "Observation", savedUUID );
    const plainObject = obs.toJSON( );
    setObservations( [plainObject] );
    return obs;
  };

  const obsEditValue = {
    currentObsIndex,
    setCurrentObsIndex,
    addSound,
    addPhotos,
    addObservations,
    addObservationNoEvidence,
    observations,
    setObservations,
    updateObservationKey,
    updateTaxon,
    saveObservation,
    saveAndUploadObservation,
    openSavedObservation
  };

  return (
    <ObsEditContext.Provider value={obsEditValue}>
      {children}
    </ObsEditContext.Provider>
  );
};

export default ObsEditProvider;
