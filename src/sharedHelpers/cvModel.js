// @flow
import { Platform } from "react-native";
import RNFS from "react-native-fs";

const modelFiles = {
  IOSMODEL: "optimized_model.mlmodelc",
  IOSTAXONOMY: "taxonomy.json",
  ANDROIDMODEL: "optimized_model.tflite",
  ANDROIDTAXONOMY: "taxonomy.csv"
};

export const dirModel: string = Platform.select( {
  ios: `${RNFS.DocumentDirectoryPath}/${modelFiles.IOSMODEL}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDMODEL}`
} );

export const dirTaxonomy: string = Platform.select( {
  ios: `${RNFS.DocumentDirectoryPath}/${modelFiles.IOSTAXONOMY}`,
  android: `${RNFS.DocumentDirectoryPath}/${modelFiles.ANDROIDTAXONOMY}`
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
    const sampleModel = "small_inception_tf1.tflite";
    const sampleTaxonomy = "small_export_tax.csv";

    const hasModel = results.find( r => r.name === model );
    const hasSampleModel = results.find( r => r.name === sampleModel );

    // Android writes over existing files
    if ( hasModel !== undefined ) {
      copyFilesAndroid( `camera/${model}`, dirModel );
      copyFilesAndroid( `camera/${taxonomy}`, dirTaxonomy );
    } else if ( hasSampleModel !== undefined ) {
      copyFilesAndroid( `camera/${sampleModel}`, dirModel );
      copyFilesAndroid( `camera/${sampleTaxonomy}`, dirTaxonomy );
    }
  } );
};

const addCameraFilesiOS = () => {
  const copyFilesiOS = ( source, destination ) => {
    RNFS.copyFile( source, destination )
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

  // external devs should swap sample model and taxonomy file
  RNFS.readDir( RNFS.MainBundlePath ).then( () => {
    const model = modelFiles.IOSMODEL;
    const taxonomy = modelFiles.IOSTAXONOMY;
    // const sampleModel = "small_inception_tf1.mlmodelc";
    // const sampleTaxonomy = "small_export_tax.json";

    copyFilesiOS( `${RNFS.MainBundlePath}/${model}`, dirModel );
    copyFilesiOS( `${RNFS.MainBundlePath}/${taxonomy}`, dirTaxonomy );
  } );
};

export const addARCameraFiles = async () => {
  // RNFS overwrites whatever files existed before
  if ( Platform.OS === "android" ) {
    addCameraFilesAndroid();
  } else if ( Platform.OS === "ios" ) {
    addCameraFilesiOS();
  }
};
