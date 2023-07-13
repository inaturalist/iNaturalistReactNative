const fs = require( "fs" ).promises;
const path = require( "path" );
const download = require( "download" );

const modelURL
  = "https://github.com/inaturalist/SeekReactNative/releases/download/v2.9.1-138/small_model.zip";

const modelPath = path.join( __dirname, "..", "temp", "model" );
const androidModelPath = path.join( modelPath, "tf1 2", "small_inception_tf1.tflite" );
const androidTaxonomyPath = path.join( modelPath, "tf1 2", "small_export_tax.csv" );
const iosModelPath = path.join( modelPath, "tf1 2", "small_inception_tf1.mlmodel" );
const iosTaxonomyPath = path.join( modelPath, "tf1 2", "small_export_tax.json" );

const androidDestinationPath = path.join(
  __dirname,
  "..",
  "android",
  "app",
  "src",
  "main",
  "assets",
  "camera"
);
const iosDestinationPath = path.join( __dirname, "..", "ios" );

( async () => {
  console.log( `Downloading example model from '${modelURL}'...` );
  await download( modelURL, modelPath, {
    extract: true
  } );
  console.log( "Downloaded!" );

  console.log( "Copying model files to assets folder..." );
  await fs.mkdir( androidDestinationPath, { recursive: true } );
  await fs.copyFile(
    androidModelPath,
    path.join( androidDestinationPath, "optimized_model.tflite" )
  );
  await fs.copyFile(
    androidTaxonomyPath,
    path.join( androidDestinationPath, "taxonomy.csv" )
  );

  await fs.mkdir( iosDestinationPath, { recursive: true } );
  await fs.copyFile(
    iosModelPath,
    path.join( iosDestinationPath, "optimized_model.mlmodel" )
  );
  await fs.copyFile(
    iosTaxonomyPath,
    path.join( iosDestinationPath, "taxonomy.json" )
  );

  console.log( "Delete temp model folder and its contents..." );
  await fs.rm( modelPath, { recursive: true } );

  console.log( "Done!" );
} )();
