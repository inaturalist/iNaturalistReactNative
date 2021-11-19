import factory from "factoria";
import path from "path";
import fs from "fs";

// Require each individual factory definition, not to use the export but just
// to register them with factoria
const pathToFactories = path.join( __dirname, "factories" );
fs.readdirSync( pathToFactories ).forEach( file => {
  const factoryName = path.basename( file, ".js" );
  require( `./factories/${factoryName}` );
} );

// Makes a basic API response from an array of results
export const makeResponse = results => ( {
  total_results: results.length,
  page: 1,
  per_page: 30,
  results
} );

export default factory;
