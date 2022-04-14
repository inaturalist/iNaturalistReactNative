// @flow
import React, { useState } from "react";
import type { Node } from "react";
import uuid from "react-native-uuid";
import { useNavigation } from "@react-navigation/native";
import Realm from "realm";

import { getTimeZone } from "../sharedHelpers/dateAndTime";
import { ObsEditContext } from "./contexts";
import createIdentification from "../components/Identify/helpers/createIdentification";
import realmConfig from "../models/index";
import fetchPlaceName from "../sharedHelpers/fetchPlaceName";
import saveLocalObservation from "./helpers/saveLocalObservation";
import uploadObservation from "./helpers/uploadObservation";

type Props = {
  children: any
}

const ObsEditProvider = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const [currentObsNumber, setCurrentObsNumber] = useState( 0 );
  const [observations, setObservations] = useState( [] );
  const [identification, setIdentification] = useState( null );
  const [prevScreen, setPrevScreen] = useState( "ObsEdit" );

  const currentObs = observations[currentObsNumber];

  const addSound = ( sound ) => {
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
    // TODO: does this need location and place name?
    const newObs = createObservation( );
    setObservations( [newObs] );
  };

  const createObservation = ( obs ) => {
    // const placeGuess = await fetchPlaceName( obs.latitude, obs.longitude );
    // console.log( placeGuess, "place guess in create obs" );
    return {
      // object should look like Seek upload observation:
      // https://github.com/inaturalist/SeekReactNative/blob/e2df7ca77517e0c4c89f3147dc5a15ed98e31c34/utility/uploadHelpers.js#L198
      ...obs,
      captive_flag: false,
      geoprivacy: "open",
      owners_identification_from_vision_requested: false,
      project_ids: [],
      time_zone: getTimeZone( ),
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

  const updateTaxaId = async ( taxaId ) => {
    if ( prevScreen === "ObsEdit" ) {
      updateObservationKey( "taxon_id", taxaId );
      navigation.navigate( "ObsEdit" );
    } else {
      const results = await createIdentification( { observation_id: observations[0].uuid, taxon_id: taxaId } );
      console.log( results, "results in update taxa id" );
      navigation.navigate( "my observations", { screen: "ObsDetail", params: { uuid: observations[0].uuid } } );
    }
  };

  const saveObservation = async ( ) => {
    const saved = await saveLocalObservation( currentObs );
    console.log( saved, "obs was saved locally" );
    navigation.navigate( "my observations" );
  };

  const saveAndUploadObservation = async ( ) => {
    const saved = await saveLocalObservation( currentObs );
    console.log( saved, "obs was saved; ready to upload" );
    uploadObservation( currentObs );
    navigation.navigate( "my observations" );
  };

  const openSavedObservation = async ( savedUUID ) => {
    try {
      const realm = await Realm.open( realmConfig );
      const obs = realm.objectForPrimaryKey( "Observation", savedUUID );
      setObservations( [obs] );
    } catch ( e ) {
      console.log( e, "couldn't save observation to realm" );
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
    updateTaxaId,
    identification,
    setIdentification,
    setPrevScreen,
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
