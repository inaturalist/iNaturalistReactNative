// @flow
import { log } from "../../react-native-logs.config";

const logger = log.extend( "INatApiError" );

export class INatApiError extends Error {
  // Object literal of the JSON body returned by the server
  json: Object;

  // HTTP status code of the server response
  status: number;

  constructor( json: Object, status?: number ) {
    super( JSON.stringify( json ) );
    this.json = json;
    this.status = status || json.status;
  }
}
// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( INatApiError.prototype, "name", {
  value: "INatApiError"
} );

async function handleError( e: Object, options: Object = {} ): Object {
  if ( !e.response ) { throw e; }

  // Try to parse JSON in the response if this was an HTTP error. If we can't
  // parse the JSON, throw that error (presumably we should not be making
  // requests to endpoints that don't return JSON)
  let errorJson;
  try {
    errorJson = await e.response.json( );
  } catch ( jsonError ) {
    if ( jsonError.message.match( /JSON Parse error/ ) ) {
      // This happens a lot and I want to know where it's coming from ~~~~kueda 20240520
      jsonError.message = `Error parsing JSON from ${e.response?.url} `
        + `(status: ${e.response?.status})`;
      logger.error( jsonError );
    }
    if ( options.throw === false ) {
      return e;
    }
    throw e;
  }
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
  // In theory code higher up in the stack will handle this error when thrown,
  // so it's probably not worth reporting at this stage. If it doesn't get
  // handled, it will get logged when it gets caught by the app-wide error
  // handler
  console.error(
    `Error requesting ${e.response.url} (status: ${e.response.status}):
    ${JSON.stringify( errorJson )}`,
    error
  );
  if ( typeof ( options.onApiError ) === "function" ) {
    options.onApiError( error );
  }
  // Default to throw errors. We almost never want supress an error at
  // this low level
  if ( options.throw === false ) {
    return error;
  }
  throw error;
}

export default handleError;
