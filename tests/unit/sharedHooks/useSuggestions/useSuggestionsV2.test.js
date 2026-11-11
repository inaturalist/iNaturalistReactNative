import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import scoreImage from "api/computerVision";
import React from "react";
import { reactQueryRetry } from "sharedHelpers/logging";
import useSuggestionsV2 from "sharedHooks/useSuggestions/useSuggestionsV2";
import factory from "tests/factory";

jest.mock( "api/computerVision", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  getJWT: jest.fn( ( ) => Promise.resolve( "jwt" ) ),
} ) );
jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
jest.mock( "sharedHelpers/logging", ( ) => ( {
  handleRetryDelay: ( ) => 0,
  reactQueryRetry: jest.fn( ( ) => false ),
} ) );

const localPhotoUri = "file:///tmp/photo.jpg";
const location = { latitude: 41.88, longitude: -87.63 };

const cupPlant = factory( "RemoteTaxon", {
  id: 745, name: "Silphium perfoliatum", rank: "species", rank_level: 10,
} );
const compassPlant = factory( "RemoteTaxon", {
  id: 746, name: "Silphium laciniatum", rank: "species", rank_level: 10,
} );
const onlineResponse = taxon => ( {
  results: [{ score: 95, combined_score: 95, taxon }],
} );

const deferred = ( ) => {
  let resolve;
  const promise = new Promise( res => { resolve = res; } );
  return { promise, resolve };
};
const neverResolves = ( ) => new Promise( ( ) => {} );

// renderedStatuses records every render, so tests can catch a single-frame
// flash that result.current would miss
const renderSuggestionsHook = initialProps => {
  const queryClient = new QueryClient( {
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  } );
  const wrapper = ( { children } ) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const renderedStatuses = [];
  const utils = renderHook( props => {
    const hookResult = useSuggestionsV2( props );
    renderedStatuses.push( hookResult.onlineStatus );
    return hookResult;
  }, { initialProps, wrapper } );
  return { ...utils, renderedStatuses };
};

const topSuggestionId = result => result.current.suggestions.topSuggestion?.taxon.id;

beforeEach( ( ) => {
  jest.clearAllMocks( );
  reactQueryRetry.mockImplementation( ( ) => false );
  scoreImage.mockResolvedValue( onlineResponse( cupPlant ) );
} );

describe( "useSuggestionsV2", ( ) => {
  it( "reports loading from the very first render", async ( ) => {
    scoreImage.mockImplementation( neverResolves );
    const { result, renderedStatuses } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    expect( result.current.isLoading ).toBe( true );
    expect( renderedStatuses[0] ).toBe( "loading" );
  } );

  it( "uses online suggestions", async ( ) => {
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( result.current.isLoading ).toBe( false );
    expect( topSuggestionId( result ) ).toBe( 745 );
  } );

  it( "sends the location with the online request", async ( ) => {
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri, location } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( scoreImage ).toHaveBeenCalledWith(
      expect.objectContaining( { lat: location.latitude, lng: location.longitude } ),
      { api_token: "jwt" },
    );
  } );

  it( "reports an online error", async ( ) => {
    scoreImage.mockRejectedValue( new Error( "server error" ) );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "error" ) );
    expect( result.current.onlineError?.message ).toBe( "server error" );
    expect( result.current.isLoading ).toBe( false );
  } );

  it( "starts over when the location changes and ignores the earlier response", async ( ) => {
    const firstRequest = deferred( );
    scoreImage
      .mockReturnValueOnce( firstRequest.promise )
      .mockResolvedValueOnce( onlineResponse( compassPlant ) );
    const {
      result, rerender, renderedStatuses,
    } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( scoreImage ).toHaveBeenCalledTimes( 1 ) );

    rerender( { photoUri: localPhotoUri, location } );
    expect( result.current.isLoading ).toBe( true );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( topSuggestionId( result ) ).toBe( 746 );

    await act( async ( ) => firstRequest.resolve( onlineResponse( cupPlant ) ) );
    expect( topSuggestionId( result ) ).toBe( 746 );
    expect( renderedStatuses ).not.toContain( "idle" );
  } );
} );
