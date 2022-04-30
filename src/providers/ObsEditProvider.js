// @flow
import React, { useState, useContext } from "react";
import type { Node } from "react";
import uuid from "react-native-uuid";
import { useNavigation } from "@react-navigation/native";
import Realm from "realm";

import { ObsEditContext } from "./contexts";
import realmConfig from "../models/index";
import saveLocalObservation from "./helpers/saveLocalObservation";
import uploadObservation from "./helpers/uploadObservation";
import Observation from "../models/Observation";
import { PhotoGalleryContext } from "./contexts";
import { useUserLocation } from "../sharedHooks/useUserLocation";
import { createObservedOnStringForUpload } from "../sharedHelpers/dateAndTime";
import ObservationSound from "../models/ObservationSound";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const latLng = useUserLocation( );
  const { setSelectedPhotos } = useContext( PhotoGalleryContext );
  const navigation = useNavigation( );
  const [currentObsNumber, setCurrentObsNumber] = useState( 0 );
  const [observations, setObservations] = useState( [] );

  const currentObs = observations[currentObsNumber];

  const addSound = async ( ) => {
    const sound = await ObservationSound.createNewSound( );
    if ( observations.length === 0 ) {
      const soundObs = createObservation( sound );
      setObservations( [soundObs] );
    } else if ( currentObs ) {
      const updatedObs = Array.from( observations );
      // $FlowFixMe
      updatedObs[currentObsNumber].observationSounds = sound.observationSounds;
      setObservations( updatedObs );
    }
  };

  const mapPhotos = ( photos ) => photos.map( p => {
    if ( p.uri ) {
      return {
        uri: p.uri,
        uuid: p.uuid
      };
    } else {
      // this is needed to navigate to CV suggestions from ObsDetail
      // rather than any of the camera/gallery screens
      return {
        uri: p.photo.url,
        uuid: p.uuid
      };
    }
  } );

  const addPhotos = ( photos ) => {
    if ( observations.length === 0 ) {
      const photoObs = createObservation( photos[0] );
      // $FlowFixMe
      photoObs.observationPhotos = mapPhotos( photos );
      setObservations( [photoObs] );
    } else if ( currentObs ) {
      const updatedObs = Array.from( observations );
      // $FlowFixMe
      let obsPhotos = updatedObs[currentObsNumber].observationPhotos;
      const newPhotos = mapPhotos( photos );

      if ( obsPhotos ) {
        // $FlowFixMe
        updatedObs[currentObsNumber].observationPhotos = obsPhotos.concat( newPhotos );
        setObservations( updatedObs );
      } else {
        // $FlowFixMe
        updatedObs[currentObsNumber].observationPhotos = newPhotos;
        setObservations( updatedObs );
      }
    }
  };

  const addObservations = ( obs ) => {
    if ( observations.length === 0 ) {
      const newObs = obs.map( o => {
        const photoObs = createObservation( o.observationPhotos[0] );
        // $FlowFixMe
        photoObs.observationPhotos = mapPhotos( o.observationPhotos );
        return photoObs;
      } );
      setObservations( newObs );
    }
    // there is probably another option here where a user
    // can keep adding gallery photos after making observations
    // but I'm not sure how that flow will work
  };

  const addObservationNoEvidence = ( ) => {
    const obs = {
      ...latLng,
      observed_on_string: createObservedOnStringForUpload( )
    };
    const newObs = createObservation( obs );
    setObservations( [newObs] );
  };

  const createObservation = ( obs ) => {
    return {
      // object should look like Seek upload observation:
      // https://github.com/inaturalist/SeekReactNative/blob/e2df7ca77517e0c4c89f3147dc5a15ed98e31c34/utility/uploadHelpers.js#L198
      ...obs,
      captive_flag: false,
      geoprivacy: "open",
      owners_identification_from_vision: false,
      project_ids: [],
      uuid: uuid.v4( )
    };
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
