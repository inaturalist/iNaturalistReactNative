// @flow

import { Platform } from "react-native";
import inatjs, { FileUpload } from "inaturalistjs";

import { getJWTToken } from "../../components/LoginSignUp/AuthenticationService";
import resizeImageForUpload from "./resizeImage";
import markUploaded from "./markUploaded";
// import fetchPlaceName from "../../../sharedHelpers/fetchPlaceName";

const uploadSound = async ( soundParams, apiToken ) => {
  const options = {
    api_token: apiToken
  };

  try {
    await inatjs.observation_sounds.create( soundParams, options );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), "couldn't upload sound" );
  }
};

const createSoundParams = async ( id, apiToken, obsToUpload ) => {
  const fileExt = Platform.OS === "andr oid" ? "mp4" : "m4a";
  const obsSoundToUpload = obsToUpload.observationSounds;
  const soundParams = {
    "observation_sound[observation_id]": id,
    "observation_sound[uuid]": obsSoundToUpload.uuid,
    file: new FileUpload( {
      uri: obsSoundToUpload.uri,
      name: `audio.${fileExt}`,
      type: `audio/${fileExt}`
    } )
  };
  uploadSound( soundParams, apiToken );
};

const uploadPhoto = async ( photoParams, apiToken ) => {
  const options = {
    api_token: apiToken
  };

  try {
    await inatjs.observation_photos.create( photoParams, options );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), "couldn't upload photo" );
  }
};

const createPhotoParams = async ( id, apiToken, obsToUpload ) => {
  console.log( obsToUpload, "create photo params" );
  const obsPhotosToUpload = obsToUpload.observationPhotos;

  if ( !obsPhotosToUpload || obsPhotosToUpload.length === 0 ) { return; }
  for ( let i = 0; i < obsPhotosToUpload.length; i += 1 ) {
    const photoToUpload = obsPhotosToUpload[i];
    const photoUri = photoToUpload.uri;
    const resizedPhoto = await resizeImageForUpload( photoUri );

    const photoParams = {
      "observation_photo[observation_id]": id,
      "observation_photo[uuid]": photoToUpload.uuid,
      file: new FileUpload( {
        uri: resizedPhoto,
        name: "photo.jpeg",
        type: "image/jpeg"
      } )
    };
    uploadPhoto( photoParams, apiToken );
  }
};

const uploadObservation = async ( obsToUpload: Object ) => {
  const FIELDS = { id: true };

  try {
    const apiToken = await getJWTToken( false );

    const uploadParams = {
      // TODO: decide how to format place_guess param
      // right now it looks like street, city, state is preferred on the web
      observation: {
        ...obsToUpload
        // where's the right place to do this? save to realm, then upload?
        // place_guess: fetchPlaceName( obsToUpload.latitude, obsToUpload.longitude )
      },
      fields: FIELDS
    };

    const options = {
      api_token: apiToken
    };

    // Alert.alert(
    //   "upload in progress",
    //   "check staging to see if upload completed",
    //   [
    //     {
    //       text: "Cancel",
    //       onPress: () => console.log( "Cancel Pressed" ),
    //       style: "cancel"
    //     },
    //     { text: "OK", onPress: () => console.log( "OK Pressed" ) }
    //   ]
    // );
    const response = await inatjs.observations.create( uploadParams, options );
    const { id } = response.results[0];
    // save id to realm and set time synced
    await markUploaded( obsToUpload.uuid, id );
    if ( obsToUpload.observationPhotos ) {
      createPhotoParams( id, apiToken, obsToUpload ); // v2
    }
    // if ( obsToUpload.observationSounds ) {
    //   createSoundParams( id, apiToken, obsToUpload ); // v2
    // }
  } catch ( e ) {
    console.log( JSON.stringify( e.response.status ), "couldn't upload observation: ", JSON.stringify( e.response ) );
  }
};

export default uploadObservation;
