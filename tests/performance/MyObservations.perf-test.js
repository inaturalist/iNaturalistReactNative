import {
  QueryClientProvider
} from "@tanstack/react-query";
import { fireEvent, screen, waitForElementToBeRemoved } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import React from "react";
import { measureRenders } from "reassure";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory from "tests/factory";
import { queryClient } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
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
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const mockUser = factory( "LocalUser" );

// Mock inaturalistjs so test suite can run
jest.mock( "inaturalistjs" );

const mockObservation = factory( "LocalObservation" );

const renderMyObs = ( ) => (
  <QueryClientProvider client={queryClient}>
    <MyObservationsContainer />
  </QueryClientProvider>
);

test( "Measure MyObservations renders", async () => {
  await measureRenders(
    renderMyObs( )
  );
} );

describe( "scenario", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    safeRealmWrite( global.mockRealms[__filename], ( ) => {
      global.mockRealms[__filename].create( "Observation", mockObservation );
    }, "write Observation, MyObs.perf-test" );
  } );

  afterEach( ( ) => {
    signOut( { realm: global.mockRealms[__filename] } );
  } );

  test( "Test tapping sync button", async () => {
    const scenario = async () => {
      const syncIcon = screen.getByTestId( "SyncButton" );
      expect( syncIcon ).toBeVisible( );
      fireEvent.press( syncIcon );
      const syncingText = screen.queryByText( /Syncing.../ );
      expect( syncingText ).toBeVisible( );
      await waitForElementToBeRemoved( ( ) => screen.queryByText( /Syncing.../ ) );
    };

    await measureRenders( renderMyObs( ), { scenario } );
  } );
} );
