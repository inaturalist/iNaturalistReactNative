import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import { photoUploadPath } from "appConstants/paths";
import MatchContainer from "components/Match/MatchContainer";
import inatjs from "inaturalistjs";
import React from "react";
import * as useLocationPermission from "sharedHooks/useLocationPermission";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { queryClient, renderAppWithComponent } from "tests/helpers/render";
import setStoreStateFeatureFlags from "tests/helpers/setStoreStateFeatureFlags";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

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
      useQuery: ( ) => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      canGoBack: jest.fn( ( ) => true ),
      navigate: jest.fn( ),
      push: jest.fn( ),
      setOptions: jest.fn( ),
    } ),
  };
} );

const localFilePath = `${photoUploadPath}/local.jpg`;

const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90,
};

const actor = userEvent.setup( );

const renderMatchWithLocalPhoto = ( ) => {
  const observation = factory( "LocalObservation", {
    latitude: 4,
    longitude: 10,
    observationPhotos: [factory( "LocalObservationPhoto", {
      photo: factory( "LocalPhoto", { url: undefined, localFilePath } ),
    } )],
  } );
  useStore.setState( {
    observations: [observation],
    currentObservation: observation,
    currentObservationIndex: 0,
  } );
  renderAppWithComponent( <MatchContainer /> );
};

const openMediaViewer = async ( ) => {
  renderMatchWithLocalPhoto( );
  await waitFor( ( ) => {
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
  } );
  await actor.press( await screen.findByTestId( "MatchScreen.ObsPhoto" ) );
};

const closeMediaViewer = async ( ) => {
  // The back button and its icon both carry the label
  const mediaViewer = screen.getByTestId( "MediaViewer" );
  const [backButton] = within( mediaViewer ).getAllByLabelText( "Go back" );
  await actor.press( backButton );
};

describe( "editing the observation photo in the Match media viewer", ( ) => {
  beforeEach( ( ) => {
    jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
      hasPermissions: true,
      renderPermissionsGate: jest.fn( ),
      requestPermissions: jest.fn( ),
    } ) );
    setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: true } );
    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
  } );

  afterEach( ( ) => {
    setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: false } );
    inatjs.computervision.score_image.mockReset( );
    // suggestions are cached per photo and location, and these tests reuse both
    queryClient.clear( );
  } );

  it( "should fetch new suggestions for the edited photo when the viewer closes", async ( ) => {
    await openMediaViewer( );

    await actor.press( await screen.findByLabelText( "Rotate photo" ) );
    await waitFor( ( ) => {
      const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
      expect( photo.localFilePath ).not.toEqual( localFilePath );
    } );
    // Nothing is identified again while the viewer is open
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
    await closeMediaViewer( );

    await waitFor( ( ) => {
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 2 );
    } );
  } );

  it( "should not fetch new suggestions when the viewer closes without edits", async ( ) => {
    await openMediaViewer( );

    await screen.findByLabelText( "Rotate photo" );
    await closeMediaViewer( );

    await waitFor( ( ) => {
      expect( screen.queryByLabelText( "Rotate photo" ) ).toBeNull( );
    } );
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
  } );
} );
