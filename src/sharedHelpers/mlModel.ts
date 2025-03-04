import i18next from "i18next";
import { Alert, Platform } from "react-native";
import Config from "react-native-config";
import RNFS from "react-native-fs";
import type { Location } from "vision-camera-plugin-inatvision";
import {
  getPredictionsForImage,
  getPredictionsForLocation,
  MODE
} from "vision-camera-plugin-inatvision";

const modelFiles = {
  // The iOS model and taxonomy files always have to be referenced in the
  // xcode project. To avoid constantly having to add new files every time we
  // change the model, we are keeping the files referenced in the xcode
  // project the same but linking them to the files specified in .env in a
  // build phase script. See ios/link-inat-model-files.sh
  IOSMODEL: "cvmodel.mlmodelc",
  IOSTAXONOMY: "taxonomy.json",
  IOSGEOMODEL: "geomodel.mlmodelc",
  ANDROIDMODEL: Config.ANDROID_MODEL_FILE_NAME,
  ANDROIDTAXONOMY: Config.ANDROID_TAXONOMY_FILE_NAME,
  ANDROIDGEOMODEL: Config.ANDROID_GEOMODEL_FILE_NAME
};

export const modelPath: string = Platform.select( {
  ios: `${RNFS.MainBundlePath}/${modelFiles.IOSMODEL}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDMODEL}`
} );

export const taxonomyPath: string = Platform.select( {
  ios: `${RNFS.MainBundlePath}/${modelFiles.IOSTAXONOMY}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDTAXONOMY}`
} );

export const geomodelPath: string = Platform.select( {
  ios: `${RNFS.MainBundlePath}/${modelFiles.IOSGEOMODEL}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDGEOMODEL}`
} );

export const modelVersion = Config.CV_MODEL_VERSION;

export const predictImage = ( uri: string, location: Location ) => {
  // Ensure uri is actually well-formed and try to make it well-formed if it's
  // a path
  let url;
  try {
    url = new URL( uri );
  } catch ( urlError ) {
    try {
      url = new URL( `file://${uri}` );
    } catch ( urlError2 ) {
      // will handle when url is blank
    }
  }
  if ( !url ) {
    throw new Error( `predictImage received invalid URI: ${uri}` );
  }
  const hasLocation = location?.latitude != null && location?.longitude != null;
  return getPredictionsForImage( {
    uri: url.toString(),
    modelPath,
    taxonomyPath,
    version: modelVersion,
    useGeomodel: hasLocation,
    geomodelPath,
    location: hasLocation
      ? location
      : undefined,
    mode: MODE.COMMON_ANCESTOR
  } );
};

export const predictLocation = ( location: Location ) => getPredictionsForLocation( {
  geomodelPath,
  taxonomyPath,
  location
} );

const addCameraFilesAndroid = () => {
  const copyFilesAndroid = ( source, destination ) => {
    RNFS.copyFileAssets( source, destination )
      .then( () => {
        console.log( `moved file from ${source} to ${destination}` );
      } )
      .catch( error => {
        console.log(
          error,
          `error moving file from ${source} to ${destination}`
        );
      } );
  };

  RNFS.readDirAssets( "camera" ).then( results => {
    const model = modelFiles.ANDROIDMODEL;
    const taxonomy = modelFiles.ANDROIDTAXONOMY;
    const geomodel = modelFiles.ANDROIDGEOMODEL;

    const hasModel = results.find( r => r.name === model );

    // Android writes over existing files
    if ( hasModel !== undefined ) {
      copyFilesAndroid( `camera/${model}`, modelPath );
      copyFilesAndroid( `camera/${taxonomy}`, taxonomyPath );
      copyFilesAndroid( `camera/${geomodel}`, geomodelPath );
    } else {
      Alert.alert(
        i18next.t( "No-model-found" ),
        i18next.t( "During-app-start-no-model-found" )
      );
    }
  } );
};

export const addARCameraFiles = ( ) => {
  // RNFS overwrites whatever files existed before
  if ( Platform.OS === "android" ) {
    addCameraFilesAndroid( );
  }
};
