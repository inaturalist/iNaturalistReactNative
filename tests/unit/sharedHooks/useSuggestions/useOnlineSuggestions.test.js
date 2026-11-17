import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";
import useOnlineSuggestions, {
  INITIAL_SCORE_IMAGE_TIMEOUT,
  RETRY_SCORE_IMAGE_TIMEOUT,
} from "sharedHooks/useSuggestions/useOnlineSuggestions";

// Simulate a score_image request that never finishes, i.e. a slow connection
jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    data: undefined,
    dataUpdatedAt: 0,
    error: null,
    fetchStatus: "fetching",
    refetch: jest.fn( ),
  } ) ),
} ) );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => null,
} ) );

jest.mock( "providers/contexts", ( ) => ( {
  __esModule: true,
  RealmContext: {
    useRealm: jest.fn( ( ) => ( {} ) ),
  },
} ) );

const queryClient = new QueryClient( );
const wrapper = ( { children } ) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Stable reference, like the containers' reducer state
const queryKey = ["scoreImage", "photo-uri", { shouldUseEvidenceLocation: false }];

const makeOptions = ( onFetchError = jest.fn( ) ) => ( {
  onFetchError,
  onFetched: jest.fn( ),
  scoreImageParams: { image: { uri: "photo-uri" } },
  queryKey,
  shouldFetchOnlineSuggestions: true,
} );

const renderOnlineSuggestions = initialProps => renderHook(
  props => useOnlineSuggestions( props ),
  { initialProps, wrapper },
);

const advance = async ms => {
  await act( async ( ) => {
    jest.advanceTimersByTime( ms );
  } );
};

describe( "useOnlineSuggestions timeout", ( ) => {
  beforeEach( ( ) => {
    jest.useFakeTimers( );
  } );

  afterEach( ( ) => {
    jest.useRealTimers( );
    queryClient.clear( );
  } );

  it( "gives an explicit retry a longer timeout than the initial request", async ( ) => {
    const { result, rerender } = renderOnlineSuggestions( makeOptions( ) );
    await advance( INITIAL_SCORE_IMAGE_TIMEOUT );
    expect( result.current.timedOut ).toBe( true );

    // Mirrors the container's retry: reset the timeout and re-render with a new
    // onFetchError, which changes identity when the online fetch status changes
    const retryOnFetchError = jest.fn( );
    await act( async ( ) => {
      result.current.resetTimeout( { isRetry: true } );
    } );
    rerender( makeOptions( retryOnFetchError ) );
    expect( result.current.timedOut ).toBe( false );

    await advance( INITIAL_SCORE_IMAGE_TIMEOUT );
    expect( retryOnFetchError ).not.toHaveBeenCalled( );
    expect( result.current.timedOut ).toBe( false );

    await advance( RETRY_SCORE_IMAGE_TIMEOUT - INITIAL_SCORE_IMAGE_TIMEOUT );
    expect( retryOnFetchError ).toHaveBeenCalledWith( { isOnline: true } );
    expect( result.current.timedOut ).toBe( true );
  } );
} );
