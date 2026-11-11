import ImageResizer from "@bam.tech/react-native-image-resizer";
import { useNetInfo } from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import scoreImage from "api/computerVision";
import i18n from "i18next";
import React from "react";
import { reactQueryRetry } from "sharedHelpers/logging";
import { predictImage } from "sharedHelpers/mlModel";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useSuggestionsV2 from "sharedHooks/useSuggestions/useSuggestionsV2";
import factory from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

jest.mock( "api/computerVision", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
jest.mock( "sharedHelpers/mlModel", ( ) => ( {
  predictImage: jest.fn( ),
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

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const localPhotoUri = "file:///tmp/photo.jpg";
const remotePhotoUri = "https://static.inaturalist.org/photos/1/medium.jpg";
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
const offlinePrediction = factory( "ModelPrediction", {
  taxon_id: 750,
  name: "Opuntia humifusa",
  rank_level: 10,
  combined_score: 95,
  ancestor_ids: [],
} );
const otherOfflinePrediction = factory( "ModelPrediction", {
  taxon_id: 752,
  name: "Opuntia engelmannii",
  rank_level: 10,
  combined_score: 95,
  ancestor_ids: [],
} );

const deferred = ( ) => {
  let resolve;
  const promise = new Promise( res => { resolve = res; } );
  return { promise, resolve };
};
const neverResolves = ( ) => new Promise( ( ) => {} );

// renderedStatuses records every render, so tests can catch a single-frame
// flash that result.current would miss
const renderSuggestionsHook = ( initialProps, queryClient = new QueryClient( {
  defaultOptions: { queries: { retry: false, gcTime: Infinity } },
} ) ) => {
  const wrapper = ( { children } ) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const renderedStatuses = [];
  const utils = renderHook( props => {
    const hookResult = useSuggestionsV2( props );
    renderedStatuses.push( hookResult.onlineStatus );
    return hookResult;
  }, { initialProps, wrapper } );
  return { ...utils, renderedStatuses, queryClient };
};

const topSuggestionId = result => result.current.suggestions.topSuggestion?.taxon.id;

beforeEach( ( ) => {
  jest.clearAllMocks( );
  reactQueryRetry.mockImplementation( ( ) => false );
  useNetInfo.mockReturnValue( { isConnected: true } );
  useCurrentUser.mockReturnValue( undefined );
  scoreImage.mockResolvedValue( onlineResponse( cupPlant ) );
  predictImage.mockResolvedValue( { predictions: [offlinePrediction] } );
} );

describe( "useSuggestionsV2", ( ) => {
  it( "reports loading from the very first render", async ( ) => {
    scoreImage.mockImplementation( neverResolves );
    const { result, renderedStatuses } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    expect( result.current.isLoading ).toBe( true );
    expect( renderedStatuses[0] ).toBe( "loading" );
  } );

  it( "keeps online suggestions when saving taxa to realm fails", async ( ) => {
    // a literal because factoria merges array overrides into the default
    // ancestor_ids; Taxon.forUpdate rejects a species without ancestors
    const taxonWithoutAncestors = {
      id: 747, name: "Silphium integrifolium", rank_level: 10, ancestor_ids: [],
    };
    scoreImage.mockResolvedValue( onlineResponse( taxonWithoutAncestors ) );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( topSuggestionId( result ) ).toBe( 747 );
  } );

  it( "uses online suggestions and skips the offline model", async ( ) => {
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( result.current.offlineStatus ).toBe( "skipped" );
    expect( result.current.isLoading ).toBe( false );
    expect( result.current.usingOfflineSuggestions ).toBe( false );
    expect( topSuggestionId( result ) ).toBe( 745 );
    expect( predictImage ).not.toHaveBeenCalled( );
    const savedTaxon = global.mockRealms[mockRealmIdentifier].objectForPrimaryKey( "Taxon", 745 );
    expect( savedTaxon?.name ).toBe( "Silphium perfoliatum" );
  } );

  it( "sends the location with the online request", async ( ) => {
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri, location } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( scoreImage ).toHaveBeenCalledWith(
      expect.objectContaining( { lat: location.latitude, lng: location.longitude } ),
      { api_token: "jwt" },
    );
  } );

  it( "falls back to the offline model when the online request fails", async ( ) => {
    scoreImage.mockRejectedValue( new Error( "server error" ) );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( result.current.onlineStatus ).toBe( "error" );
    expect( result.current.onlineError?.message ).toBe( "server error" );
    expect( result.current.usingOfflineSuggestions ).toBe( true );
    expect( topSuggestionId( result ) ).toBe( 750 );
  } );

  it( "falls back to the offline model when the online request times out", async ( ) => {
    scoreImage.mockImplementation( neverResolves );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri, onlineTimeoutMs: 50 } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( result.current.onlineStatus ).toBe( "timed-out" );
    expect( topSuggestionId( result ) ).toBe( 750 );
  } );

  it( "doesn't retry a photo that fails to resize", async ( ) => {
    reactQueryRetry.mockImplementation( failureCount => failureCount < 2 );
    ImageResizer.createResizedImage.mockRejectedValueOnce( new Error( "403" ) );
    const { result } = renderSuggestionsHook( { photoUri: remotePhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( result.current.onlineStatus ).toBe( "error" );
    expect( ImageResizer.createResizedImage ).toHaveBeenCalledTimes( 1 );
    expect( reactQueryRetry ).not.toHaveBeenCalled( );
    expect( scoreImage ).not.toHaveBeenCalled( );
  } );

  it( "goes straight to the offline model when the device is offline", async ( ) => {
    useNetInfo.mockReturnValue( { isConnected: false } );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( result.current.onlineStatus ).toBe( "offline" );
    expect( scoreImage ).not.toHaveBeenCalled( );
  } );

  it( "falls back to the offline model when the connection drops mid-request", async ( ) => {
    scoreImage.mockImplementation( neverResolves );
    const props = { photoUri: localPhotoUri };
    const { result, rerender } = renderSuggestionsHook( props );
    await waitFor( ( ) => expect( scoreImage ).toHaveBeenCalled( ) );
    useNetInfo.mockReturnValue( { isConnected: false } );
    rerender( props );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( result.current.onlineStatus ).toBe( "offline" );
  } );

  it( "skips the offline model for a remote photo while offline", async ( ) => {
    useNetInfo.mockReturnValue( { isConnected: false } );
    const { result } = renderSuggestionsHook( { photoUri: remotePhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "skipped" ) );
    expect( result.current.isLoading ).toBe( false );
    expect( result.current.urlWillCrashOffline ).toBe( true );
    expect( predictImage ).not.toHaveBeenCalled( );
  } );

  it( "reports an offline model failure instead of throwing", async ( ) => {
    useNetInfo.mockReturnValue( { isConnected: false } );
    predictImage.mockRejectedValue( new Error( "model missing" ) );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "error" ) );
    expect( result.current.offlineError?.message ).toBe( "model missing" );
    expect( result.current.isLoading ).toBe( false );
  } );

  it( "finishes with no suggestions when the offline model returns nothing", async ( ) => {
    useNetInfo.mockReturnValue( { isConnected: false } );
    predictImage.mockResolvedValue( null );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( result.current.suggestions.topSuggestion ).toBeUndefined( );
  } );

  it( "waits until enabled", async ( ) => {
    const { result, rerender } = renderSuggestionsHook( {
      photoUri: localPhotoUri, enabled: false,
    } );
    expect( result.current.onlineStatus ).toBe( "idle" );
    expect( result.current.isLoading ).toBe( false );
    expect( scoreImage ).not.toHaveBeenCalled( );
    rerender( { photoUri: localPhotoUri, enabled: true } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
  } );

  it( "doesn't show the earlier result when re-enabled with the same inputs", async ( ) => {
    const {
      result, rerender, renderedStatuses,
    } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    rerender( { photoUri: localPhotoUri, enabled: false } );
    expect( result.current.onlineStatus ).toBe( "idle" );

    const reenabledAt = renderedStatuses.length;
    rerender( { photoUri: localPhotoUri, enabled: true } );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( renderedStatuses[reenabledAt] ).toBe( "loading" );
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

  it( "ignores an offline result from earlier inputs", async ( ) => {
    useNetInfo.mockReturnValue( { isConnected: false } );
    const firstPrediction = deferred( );
    predictImage
      .mockReturnValueOnce( firstPrediction.promise )
      .mockResolvedValueOnce( { predictions: [otherOfflinePrediction] } );
    const { result, rerender } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( predictImage ).toHaveBeenCalledTimes( 1 ) );

    rerender( { photoUri: localPhotoUri, location } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    expect( topSuggestionId( result ) ).toBe( 752 );

    await act( async ( ) => firstPrediction.resolve( { predictions: [offlinePrediction] } ) );
    expect( topSuggestionId( result ) ).toBe( 752 );
  } );

  it( "reuses the earlier response when inputs change back", async ( ) => {
    scoreImage
      .mockResolvedValueOnce( onlineResponse( cupPlant ) )
      .mockResolvedValueOnce( onlineResponse( compassPlant ) );
    const { result, rerender } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( topSuggestionId( result ) ).toBe( 745 ) );
    rerender( { photoUri: localPhotoUri, location } );
    await waitFor( ( ) => expect( topSuggestionId( result ) ).toBe( 746 ) );
    rerender( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( topSuggestionId( result ) ).toBe( 745 ) );
    expect( scoreImage ).toHaveBeenCalledTimes( 2 );
  } );

  it( "requests online suggestions again in a new app language", async ( ) => {
    useCurrentUser.mockReturnValue( factory( "LocalUser" ) );
    const {
      result: firstResult, unmount, queryClient,
    } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( firstResult.current.onlineStatus ).toBe( "fetched" ) );
    unmount( );
    const { language } = i18n;
    await act( async ( ) => { await i18n.changeLanguage( "es" ); } );
    try {
      const { result } = renderSuggestionsHook( { photoUri: localPhotoUri }, queryClient );
      await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    } finally {
      await act( async ( ) => { await i18n.changeLanguage( language ); } );
    }
    expect( scoreImage ).toHaveBeenCalledTimes( 2 );
    // signed-in users get names in their account's language
    expect( scoreImage ).toHaveBeenLastCalledWith(
      expect.not.objectContaining( { locale: expect.anything( ) } ),
      { api_token: "jwt" },
    );
  } );

  it( "requests online suggestions again on retry", async ( ) => {
    scoreImage.mockRejectedValueOnce( new Error( "server error" ) );
    const { result } = renderSuggestionsHook( { photoUri: localPhotoUri } );
    await waitFor( ( ) => expect( result.current.offlineStatus ).toBe( "fetched" ) );
    act( ( ) => result.current.retry( ) );
    await waitFor( ( ) => expect( result.current.onlineStatus ).toBe( "fetched" ) );
    expect( result.current.usingOfflineSuggestions ).toBe( false );
    expect( topSuggestionId( result ) ).toBe( 745 );
    expect( scoreImage ).toHaveBeenCalledTimes( 2 );
  } );
} );
