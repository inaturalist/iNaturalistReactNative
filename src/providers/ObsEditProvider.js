// @flow
import React, { useState, useContext } from "react";
import type { Node } from "react";
import { useNavigation } from "@react-navigation/native";
import Realm from "realm";

import { ObsEditContext } from "./contexts";
import realmConfig from "../models/index";
import saveLocalObservation from "./helpers/saveLocalObservation";
import uploadObservation from "./helpers/uploadObservation";
import Observation from "../models/Observation";
import { PhotoGalleryContext } from "./contexts";
import ObservationSound from "../models/ObservationSound";
import ObservationPhoto from "../models/ObservationPhoto";
import { formatCameraDate } from "../sharedHelpers/dateAndTime";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const { setSelectedPhotos } = useContext( PhotoGalleryContext );
  const navigation = useNavigation( );
  const [currentObsNumber, setCurrentObsNumber] = useState( 0 );
  const [observations, setObservations] = useState( [] );

  const currentObs = observations[currentObsNumber];

  const addSound = async ( ) => {
    const sound = await ObservationSound.createNewSound( );
    const newObs = await Observation.createObsWithSounds( [sound] );
    setObservations( [newObs] );
  };

  const addPhotos = async ( photos ) => {
    const observedOn = formatCameraDate( photos[0].metadata["{Exif}"].DateTimeOriginal );

    const obsPhotos = await Promise.all( photos.map( async photo => {
      const obsPhoto = await ObservationPhoto.formatObsPhotoFromNormalCamera( photo );
      return obsPhoto;
    } ) );

    const newObs = await Observation.createObsWithPhotos( obsPhotos, observedOn );
    setObservations( [newObs] );
  };

  const addObservations = async ( obs ) => setObservations( obs );

  const addObservationNoEvidence = async ( ) => {
    const newObs = await Observation.createObsWithNoEvidence( );
    setObservations( [newObs] );
  };

  const updateObservationKey = ( key, value ) => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObsNumber ) {
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
      setCurrentObsNumber( 0 );
      setObservations( [] );
      setSelectedPhotos( {} );

      navigation.navigate( "my observations", {
        screen: "ObsList",
        params: { savedLocalData: true }
      } );
    } else {
      if ( currentObsNumber === observations.length - 1 ) {
        observations.pop( );
        setCurrentObsNumber( observations.length - 1 );
        setObservations( observations );
      } else {
        observations.splice( currentObsNumber, 1 );
        setCurrentObsNumber( currentObsNumber );
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
    try {
      const realm = await Realm.open( realmConfig );
      const obs = realm.objectForPrimaryKey( "Observation", savedUUID );
      setObservations( [obs] );
    } catch ( e ) {
      console.log( e, "couldn't open saved observation in realm" );
    }
  };

  const obsEditValue = {
    currentObsNumber,
    setCurrentObsNumber,
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
