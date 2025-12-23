import { log } from "../../react-native-logs.config";

const logger = log.extend( "INatApiError" );

export class INatApiError extends Error {
  // Object literal of the JSON body returned by the server
  json: Record<string, unknown>;

  // HTTP status code of the server response
  status: number;

  // Additional context information
  context: Record<string, unknown> | null;

  constructor(
    json: Record<string, unknown> & { status: string | number },
    status?: number,
    context?: Record<string, unknown> | null,
  ) {
    super( JSON.stringify( json ) );
    this.name = "INatApiError";
    this.json = json;
    this.status = status || Number( json.status );
    this.context = context || null;
  }
}

export class INatApiUnauthorizedError extends INatApiError {
  constructor( context?: Record<string, unknown> ) {
    const errorJson = {
      error: "Unauthorized",
      status: 401,
      context,
    };
    super( errorJson, 401, context );
    this.name = "INatApiUnauthorizedError";
  }
}

export class INatApiTooManyRequestsError extends INatApiError {
  constructor( context?: Record<string, unknown> ) {
    const errorJson = {
      error: "Too Many Requests",
      status: 429,
      context,
    };
    super( errorJson, 429, context );
    this.name = "INatApiTooManyRequestsError";
  }
}

interface HandleErrorOptions {
  queryKey?: unknown[];
  failureCount?: number;
  routeName?: string;
  routeParams?: Record<string, unknown>;
  context?: Record<string, unknown>;
  throw?: boolean;
  onApiError?: ( error: INatApiError ) => void;
}

export interface ErrorWithResponse {
  response?: {
    status: number;
    url: string;
    json: () => Promise<{
      status: string;
      errors: {
        errorCode: string;
        message: string;
        from: string | null;
        stack: string | null;
      }[];
    }>;
  };
  status?: number;
  name?: string;
  routeName?: string;
  routeParams?: Record<string, unknown>;
}

function createContext(
  e: ErrorWithResponse,
  options: HandleErrorOptions,
  extraContext: Record<string, unknown> | null,
) {
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
    ...( extraContext || {} ),
  };
  // Remove nullish values (null or undefined) from context
  return Object.fromEntries(
    Object.entries( context ).filter(
      ( [_, value] ) => value !== null && value !== undefined,
    ),
  );
}

async function handleError(
  e: ErrorWithResponse,
  options: HandleErrorOptions = {},
): Promise<INatApiError | ErrorWithResponse> {
  // Get context from options if available
  const originalContext = options?.context || null;
  const context = createContext( e, options, originalContext );
  if ( !e.response ) {
    if ( e.status === 429 ) {
      logger.error( "429 without a response in handleError:", JSON.stringify( context ) );
      throw new INatApiTooManyRequestsError( context );
    } else if ( e.status === 401 ) {
      logger.error( "401 without a response in handleError:", JSON.stringify( context ) );
      throw new INatApiUnauthorizedError( context );
    }
    throw e;
  }

  // 429 responses don't return JSON so the parsing that we do below will
  // fail. Info about the request that triggered the 429 response is
  // kind of irrelevant. It's the behaviors that led up to being blocked that
  // matter. We log it anyhow.
  if ( e.response.status === 429 ) {
    logger.error( "429 with a response in handleError:", JSON.stringify( context ) );
    throw new INatApiTooManyRequestsError( context );
  } else if ( e.response.status === 401 ) {
    logger.error( "401 with a response in handleError:", JSON.stringify( context ) );
    throw new INatApiUnauthorizedError( context );
  }

  // Try to parse JSON in the response if this was an HTTP error. If we can't
  // parse the JSON, throw that error (presumably we should not be making
  // requests to endpoints that don't return JSON)
  let errorJson;
  try {
    errorJson = await e.response.json( );
  } catch ( jsonError: unknown ) {
    if ( jsonError instanceof Error && jsonError.message.match( /JSON Parse error/ ) ) {
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
      : "No context",
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
