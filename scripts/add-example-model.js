// eslint-disable-next-line import/no-extraneous-dependencies
const { DownloaderHelper } = require( "node-downloader-helper" );
const fs = require( "fs" ).promises;
const path = require( "path" );
// eslint-disable-next-line import/no-extraneous-dependencies
const Decompress = require( "decompress" );

const filename = "small_model.zip";
const modelURL
  = "https://github.com/inaturalist/SeekReactNative/releases/download/v2.9.1-138/small_model.zip";

const modelPath = path.join( __dirname, "..", "temp", "model" );
const examplePath = path.join( modelPath, "tf1 2" );
const androidModelFile = "small_inception_tf1.tflite";
const androidTaxonomyFile = "small_export_tax.csv";
const iosModelFile = "small_inception_tf1.mlmodel";
const iosTaxonomyFile = "small_export_tax.json";
const androidModelPath = path.join( examplePath, androidModelFile );
const androidTaxonomyPath = path.join( examplePath, androidTaxonomyFile );
const iosModelPath = path.join( examplePath, iosModelFile );
const iosTaxonomyPath = path.join( examplePath, iosTaxonomyFile );

const androidDestinationPath
  = path.join( __dirname, "..", "android", "app", "src", "debug", "assets", "camera" );
const iosDestinationPath = path.join( __dirname, "..", "ios" );

( async () => {
  console.log( `Downloading example model from '${modelURL}'...` );
  await fs.mkdir( modelPath, { recursive: true } );
  const dl = new DownloaderHelper( modelURL, modelPath );
  dl.on( "end", () => console.log( "Download Completed" ) );
  dl.on( "error", err => console.log( "Download Failed", err ) );
  await dl.start().catch( err => console.error( err ) );
  console.log( "Downloaded!" );

  console.log( "Unzipping!" );
  const zipPath = path.join( modelPath, filename );
  await Decompress( zipPath, modelPath )
    .then( () => {
      console.log( "Done Unzipping!" );
    } )
    .catch( error => console.log( error ) );

  console.log( "Copying model files to assets folder..." );
  await fs.mkdir( androidDestinationPath, { recursive: true } );
  await fs.copyFile( androidModelPath, path.join( androidDestinationPath, androidModelFile ) );
  await fs.copyFile(
    androidTaxonomyPath,
    path.join( androidDestinationPath, androidTaxonomyFile )
  );

  await fs.mkdir( iosDestinationPath, { recursive: true } );
  await fs.copyFile( iosModelPath, path.join( iosDestinationPath, iosModelFile ) );
  await fs.copyFile( iosTaxonomyPath, path.join( iosDestinationPath, iosTaxonomyFile ) );
  console.log( "Copying geo model placeholder to be model file..." );
  await fs.copyFile(
    path.join( iosDestinationPath, "geomodel.placeholder" ),
    path.join( iosDestinationPath, "geomodel.mlmodel" )
  );

  console.log( "Delete temp model folder and its contents..." );
  await fs.rm( modelPath, { recursive: true } );

  console.log( "Done!" );
} )();
