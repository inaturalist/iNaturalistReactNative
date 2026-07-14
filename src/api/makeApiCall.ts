import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiOpts } from "api/types";

type ApiParams = Record<string, unknown>;

// inaturalistjs is untyped, so endpoints are loosely typed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiEndpoint = ( ...args: any[] ) => Promise<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = any;

type ExtractMode = "results" | "firstResult" | "totalResults";

interface ApiCallConfig<ResultT = unknown> {
  // Included in the error context for logging
  functionName: string;
  // Merged under caller params: { ...defaultParams, ...params }
  defaultParams?: ApiParams;
  // Merged over caller params: { ...params, ...overrideParams }
  overrideParams?: ApiParams;
  // How to extract the return value from the response. Defaults to returning
  // the full response
  extract?: ExtractMode | ( ( response: ApiResponse ) => ResultT );
  // Maps to handleError's { throw: true }
  throwOnError?: boolean;
}

type ApiCallResult<ResultT> = Promise<ResultT | null | INatApiError | ErrorWithResponse>;

function extractResult<ResultT>(
  response: ApiResponse,
  extract?: ApiCallConfig<ResultT>["extract"],
) {
  if ( !extract ) return response;
  if ( typeof extract === "function" ) return extract( response );
  switch ( extract ) {
    case "results":
      return response?.results ?? null;
    case "firstResult":
      return response?.results?.length > 0
        ? response.results[0]
        : null;
    case "totalResults":
      return response?.total_results;
    default:
      return response;
  }
}

async function callEndpoint<ResultT>(
  call: ( ) => Promise<ApiResponse>,
  config: ApiCallConfig<ResultT>,
  errorContext: Record<string, unknown>,
): ApiCallResult<ResultT> {
  try {
    const response = await call( );
    return extractResult( response, config.extract );
  } catch ( e ) {
    return handleError( e as ErrorWithResponse, {
      context: errorContext,
      ...( config.throwOnError
        ? { throw: true }
        : {} ),
    } );
  }
}

// Creates a wrapper with the standard ( params, opts ) signature
export function makeApiCall<ResultT = unknown>(
  endpoint: ApiEndpoint,
  config: ApiCallConfig<ResultT>,
) {
  return async (
    params: ApiParams = {},
    opts: ApiOpts = {},
  ): ApiCallResult<ResultT> => callEndpoint(
    ( ) => endpoint(
      { ...config.defaultParams, ...params, ...config.overrideParams },
      opts,
    ),
    config,
    { functionName: config.functionName, opts },
  );
}

// Creates a wrapper with a positional id first argument,
// e.g. inatjs.places.fetch( id, params, opts )
export function makeApiCallWithId<ResultT = unknown>(
  endpoint: ApiEndpoint,
  config: ApiCallConfig<ResultT>,
) {
  return async (
    id: number | string | ( number | string )[],
    params: ApiParams = {},
    opts: ApiOpts = {},
  ): ApiCallResult<ResultT> => callEndpoint(
    ( ) => endpoint( id, { ...config.defaultParams, ...params }, opts ),
    config,
    { functionName: config.functionName, id, opts },
  );
}

// Creates a wrapper that takes only an id and wraps it as { id },
// e.g. inatjs.comments.delete( { id }, opts )
export function makeApiCallById<ResultT = unknown>(
  endpoint: ApiEndpoint,
  config: ApiCallConfig<ResultT>,
) {
  return async (
    id: number | string,
    opts: ApiOpts = {},
  ): ApiCallResult<ResultT> => callEndpoint(
    ( ) => endpoint( { id }, opts ),
    config,
    { functionName: config.functionName, id, opts },
  );
}
