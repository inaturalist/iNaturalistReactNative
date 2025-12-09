import { screen, waitFor } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ObsDetailsDefaultModeScreensWrapper
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeScreensWrapper";
import inatjs from "inaturalistjs";
import React from "react";
import Observation from "realmModels/Observation";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";
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

const mockComment = factory( "RemoteComment" );
const mockObservation = factory( "RemoteObservation", {
  comments: [mockComment]
} );
const mockUpdate = factory( "RemoteUpdate", {
  resource_uuid: mockObservation.uuid,
  comment_id: mockComment.id,
  viewed: false
} );
const mockUser = factory( "LocalUser" );

// Mock api call to fetch observation so it looks like a remote copy exists
inatjs.observations.fetch.mockResolvedValue( makeResponse( [mockObservation] ) );

// Mock api call to observations
jest.mock( "inaturalistjs" );
inatjs.observations.update.mockResolvedValue( makeResponse( [mockUpdate] ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    addEventListener: () => undefined,
    useNavigation: () => ( {
      navigate: jest.fn(),
      setOptions: jest.fn(),
      canGoBack: jest.fn( ( ) => true )
    } ),
    useRoute: () => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } )
  };
} );

// Run the same suite of tests for multiple ObsDetails container
describe.each( [
  { Container: ObsDetailsContainer, name: "ObsDetailsContainer" },
  { Container: ObsDetailsDefaultModeScreensWrapper, name: "ObsDetailsDefaultModeScreensWrapper" }
] )( "ObsDetails", ( { Container, name } ) => {
  beforeAll( async () => {
    jest.useFakeTimers( );
    signIn( mockUser, { realm: global.mockRealms[__filename] } );
    Observation.upsertRemoteObservations( [mockObservation], global.mockRealms[__filename] );
  } );

  afterEach( () => {
    jest.clearAllMocks();
    signOut( { realm: global.mockRealms[__filename] } );
  } );

  describe( name, ( ) => {
    describe( "with an observation where we don't know if the user has viewed comments", ( ) => {
      it( "should make a request to observation/viewedUpdates", async ( ) => {
        // Let's make sure the mock hasn't already been used
        expect( inatjs.observations.viewedUpdates ).not.toHaveBeenCalled();
        const observation = global.mockRealms[__filename].objectForPrimaryKey(
          "Observation",
          mockObservation.uuid
        );
        // Expect the observation in realm to have comments_viewed param not initialized
        expect( observation.comments_viewed ).not.toBeTruthy();
        renderAppWithComponent( <Container /> );
        expect(
          await screen.findByText( observation.user.login )
        ).toBeTruthy();
        await waitFor( ( ) => {
          expect( inatjs.observations.viewedUpdates ).toHaveBeenCalledTimes( 1 );
        } );
        // Expect the observation in realm to have been updated with comments_viewed = true
        expect( observation.comments_viewed ).toBe( true );
      } );
    } );
  } );
} );
