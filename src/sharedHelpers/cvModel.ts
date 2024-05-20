import i18next from "i18next";
import { Alert, Platform } from "react-native";
import Config from "react-native-config";
import RNFS from "react-native-fs";
import { log } from "sharedHelpers/logger";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

const logger = log.extend( "cvModel" );

const modelFiles = {
  // The iOS model and taxonomy files always have to be referenced in the
  // xcode project. To avoid constantly having to add new files every time we
  // change the model, we are keeping the files referenced in the xcode
  // project the same but linking them to the files specified in .env in a
  // build phase script. See ios/link-inat-model-files.sh
  IOSMODEL: "cvmodel.mlmodelc",
  IOSTAXONOMY: "taxonomy.json",
  ANDROIDMODEL: Config.ANDROID_MODEL_FILE_NAME,
  ANDROIDTAXONOMY: Config.ANDROID_TAXONOMY_FILE_NAME
};

export const modelPath: string = Platform.select( {
  ios: `${RNFS.MainBundlePath}/${modelFiles.IOSMODEL}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDMODEL}`
} );

export const taxonomyPath: string = Platform.select( {
  ios: `${RNFS.MainBundlePath}/${modelFiles.IOSTAXONOMY}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDTAXONOMY}`
} );

export const modelVersion = Config.CV_MODEL_VERSION;

export const predictImage = ( uri: string ) => getPredictionsForImage( {
  uri,
  modelPath,
  taxonomyPath,
  version: modelVersion,
  confidenceThreshold: 0.2
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

    const hasModel = results.find( r => r.name === model );

    // Android writes over existing files
    if ( hasModel !== undefined ) {
      logger.debug( "Found model asset found with filename", model );
      copyFilesAndroid( `camera/${model}`, modelPath );
      copyFilesAndroid( `camera/${taxonomy}`, taxonomyPath );
    } else {
      logger.debug( "No model asset found to copy into document directory." );
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
