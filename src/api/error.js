// @flow

import { log } from "../../react-native-logs.config";

const logger = log.extend( "INatApiError" );

export class INatApiError extends Error {
  // Object literal of the JSON body returned by the server
  json: Object;

  // HTTP status code of the server response
  status: number;

  // Additional context information
  context: ?Object;

  constructor( json: Object, status?: number, context?: Object ) {
    super( JSON.stringify( json ) );
    this.json = json;
    this.status = status || json.status;
    this.context = context || null;
  }
}
// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( INatApiError.prototype, "name", {
  value: "INatApiError"
} );

export class INatApiUnauthorizedError extends INatApiError {
  constructor( context?: Object ) {
    const errorJson = {
      error: "Unauthorized",
      status: 401,
      context
    };
    super( errorJson, 401, context );
  }
}

export class INatApiTooManyRequestsError extends INatApiError {
  constructor( context?: Object ) {
    const errorJson = {
      error: "Too Many Requests",
      status: 429,
      context
    };
    super( errorJson, 429, context );
  }
}

Object.defineProperty( INatApiTooManyRequestsError.prototype, "name", {
  value: "INatApiTooManyRequestsError"
} );
function createContext( e, options, extraContext ) {
  const context = {
    queryKey: options?.queryKey
      ? JSON.stringify( options.queryKey )
      : "unknown",
    failureCount: options?.failureCount,
    timestamp: new Date().toISOString(),
    errorType: e?.name || "Unknown",
    status: e?.status || ( e.response
      ? e.response.status
      : null ),
    url: e?.response?.url,
    routeName: options?.routeName || e?.routeName,
    routeParams: options?.routeParams || e?.routeParams,
    ...( extraContext || {} )
  };
  // Remove nullish values (null or undefined) from context
  return Object.fromEntries(
    Object.entries( context ).filter(
      ( [_, value] ) => value !== null && value !== undefined
    )
  );
}

async function handleError( e: Object, options: Object = {} ): Object {
  // Get context from options if available
  const originalContext = options?.context || null;
  const context = createContext( e, options, originalContext );
  if ( e.status === 429 ) {
    logger.error( "429 without a response in handleError:", JSON.stringify( context ) );
  }

  if ( !e.response ) { throw e; }

  // 429 responses don't return JSON so the parsing that we do below will
  // fail. Info about the request that triggered the 429 response is
  // kind of irrelevant. It's the behaviors that led up to being blocked that
  // matter. We log it anyhow.
  if ( e.response.status === 429 ) {
    logger.error( "429 with a response in handleError:", JSON.stringify( context ) );
    throw new INatApiTooManyRequestsError( context );
  } else if ( e.response.status === 401 ) {
    throw new INatApiUnauthorizedError( context );
  }

  // Try to parse JSON in the response if this was an HTTP error. If we can't
  // parse the JSON, throw that error (presumably we should not be making
  // requests to endpoints that don't return JSON)
  let errorJson;
  try {
    errorJson = await e.response.json( );
  } catch ( jsonError ) {
    if ( jsonError.message.match( /JSON Parse error/ ) ) {
      // This happens a lot and I want to know where it's coming from ~~~~kueda 20240520
      jsonError.message = `Error parsing JSON from ${e.response.url} `
        + `(status: ${e.response.status})`;
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

  const error = new INatApiError( errorJson, e.response.status, originalContext );

  // In theory code higher up in the stack will handle this error when thrown,
  // so it's probably not worth reporting at this stage. If it doesn't get
  // handled, it will get logged when it gets caught by the app-wide error
  // handler
  console.error(
    `Error requesting ${e.response.url} (status: ${e.response.status}):
    ${JSON.stringify( errorJson )}`,
    error,
    error.context
      ? JSON.stringify( error.context )
      : "No context"
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
