// Integration test for simple mode
import { screen, waitFor } from "@testing-library/react-native";
import ObsDetailsDefaultModeContainer
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeContainer";
import React from "react";
import Observation from "realmModels/Observation";
import factory from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
);
jest.mock( "realmModels/index", () => mockRealmModelsIndex );
jest.mock( "providers/contexts", () => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: () => global.mockRealms[mockRealmIdentifier],
      useQuery: () => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

// Mock remote observation that's already synced
const mockSyncedObservation = factory( "RemoteObservation" );

// Mock unsynchronized local observation
const mockUnsyncedObservation = factory( "LocalObservation", {
  _synced_at: null,
  id: null
} );

// Mock user
const mockUser = factory( "LocalUser" );

// Mock route parameters for different test cases
const mockUnsyncedObsRoute = {
  params: {
    uuid: mockUnsyncedObservation.uuid
  }
};

const mockSyncedObsRoute = {
  params: {
    uuid: mockSyncedObservation.uuid
  }
};

// Mock api call to fetch observation
jest.mock( "inaturalistjs", () => {
  const originalModule = jest.requireActual( "inaturalistjs" );
  return {
    ...originalModule,
    observations: {
      ...originalModule.observations,
      fetch: jest.fn().mockResolvedValue( { results: [mockSyncedObservation] } ),
      viewedUpdates: jest.fn().mockResolvedValue( { results: [] } )
    }
  };
} );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    addEventListener: () => undefined,
    useNavigation: () => ( {
      navigate: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
      canGoBack: jest.fn( () => true )
    } ),
    useRoute: jest.fn()
  };
} );

describe( "ObsDetailsDefaultMode SimpleMode Integration", () => {
  beforeAll( () => {
    jest.useFakeTimers();
  } );

  beforeEach( () => {
    jest.clearAllMocks();
  } );

  afterEach( () => {
    signOut( { realm: global.mockRealms[mockRealmIdentifier] } );
  } );

  it( "shows simple mode for unsynced observations when user is not logged in", async () => {
    // Set up a logged out state
    signOut( { realm: global.mockRealms[mockRealmIdentifier] } );

    // Save the unsynced observation to Realm
    Observation.upsertRemoteObservations(
      [mockUnsyncedObservation],
      global.mockRealms[mockRealmIdentifier]
    );

    // Mock the route to use our unsynced observation
    const { useRoute } = require( "@react-navigation/native" );
    useRoute.mockReturnValue( mockUnsyncedObsRoute );

    renderAppWithComponent( <ObsDetailsDefaultModeContainer /> );

    // Simple mode should hide the CommunitySection
    await waitFor( () => {
      expect( screen.queryByText( "Community-Discussion" ) ).toBeNull();
    } );

    // Simple mode should hide the DetailsSection
    await waitFor( () => {
      expect( screen.queryByText( "Details" ) ).toBeNull();
    } );
  } );

  it( "shows all sections for synced observations when user is logged in", async () => {
    // Set up a logged in state
    signIn( mockUser, { realm: global.mockRealms[mockRealmIdentifier] } );

    // Save the synced observation to Realm
    Observation.upsertRemoteObservations(
      [mockSyncedObservation],
      global.mockRealms[mockRealmIdentifier]
    );

    // Mock the route to use our synced observation
    const { useRoute } = require( "@react-navigation/native" );
    useRoute.mockReturnValue( mockSyncedObsRoute );

    renderAppWithComponent( <ObsDetailsDefaultModeContainer /> );

    // Regular mode should show CommunitySection
    await waitFor( () => {
      expect( screen.getByText( "Community-Discussion" ) ).toBeTruthy();
    } );

    // Regular mode should show DetailsSection
    await waitFor( () => {
      expect( screen.getByText( "Details" ) ).toBeTruthy();
    } );
  } );

  it( "shows all sections for other users' observations even when not logged in", async () => {
    // Set up a logged out state
    signOut( { realm: global.mockRealms[mockRealmIdentifier] } );

    // Save the synced observation from another user to Realm
    const otherUserObservation = factory( "RemoteObservation", {
      user: factory( "RemoteUser", { id: 9999 } ) // Different from mockUser
    } );
    Observation.upsertRemoteObservations(
      [otherUserObservation],
      global.mockRealms[mockRealmIdentifier]
    );

    // Mock the route to use the other user's observation
    const { useRoute } = require( "@react-navigation/native" );
    useRoute.mockReturnValue( {
      params: {
        uuid: otherUserObservation.uuid
      }
    } );

    renderAppWithComponent( <ObsDetailsDefaultModeContainer /> );

    // Regular mode should show CommunitySection
    await waitFor( () => {
      expect( screen.getByText( "Community-Discussion" ) ).toBeTruthy();
    } );

    // Regular mode should show DetailsSection
    await waitFor( () => {
      expect( screen.getByText( "Details" ) ).toBeTruthy();
    } );
  } );
} );
