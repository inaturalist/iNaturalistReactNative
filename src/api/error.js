// @flow
import { log } from "../../react-native-logs.config";

const logger = log.extend( "INatApiError" );

class INatApiError extends Error {
  // Object literal of the JSON body returned by the server
  json: Object;

  // HTTP status code of the server response
  status: number;

  constructor( json, status ) {
    super( JSON.stringify( json ) );
    this.json = json;
    this.status = status || json.status;
  }
}
// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( INatApiError.prototype, "name", {
  value: "INatApiError"
} );

const handleError = async ( e: Object, options: Object = {} ): Object => {
  if ( !e.response ) { throw e; }
  const errorJson = await e.response.json( );
  // Handle some of the insanity of our errors
  if ( errorJson.errors ) {
    errorJson.errors = errorJson.errors.map( error => {
      if ( error.message && error.message.match( /":/ ) ) {
        error.message = JSON.parse( error.message );
      }
      return error;
    } );
  }
  const error = new INatApiError( errorJson, e.response.status );
  // TODO: this will log all errors handled here to the log file, in a production build
  // we probably don't want to do that, so change this back to console.error at one point
  logger.error(
    `Error requesting ${e.response.url} (status: ${e.response.status}): ${errorJson}`
  );
  // Default to throw errors. We almost never want handle supress an error at
  // this low level
  if ( options.throw === false ) {
    return null;
  }
  throw error;
};

export default handleError;
