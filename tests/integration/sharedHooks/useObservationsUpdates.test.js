import { renderHook } from "@testing-library/react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useObservationsUpdates from "sharedHooks/useObservationsUpdates";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
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

jest.mock( "api/observations" );

const mockUser = factory( "LocalUser" );

const mockCommentUpdate = factory( "RemoteUpdate", {
  comment_id: 1,
  viewed: false,
  resource_uuid: faker.string.uuid( ),
} );
const mockIdentificationUpdate = factory( "RemoteUpdate", {
  identification_id: 2,
  viewed: false,
  resource_uuid: faker.string.uuid( ),
} );
const mockData = [mockCommentUpdate, mockIdentificationUpdate];

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockData,
  } ),
} ) );

const mockObservation = factory( "LocalObservation", {
  comments_viewed: false,
  identifications_view: false,
} );

describe( "useObservationsUpdates", ( ) => {
  it( "should return an object", ( ) => {
    const { result } = renderHook( ( ) => useObservationsUpdates( ) );
    expect( result.current ).toBeInstanceOf( Object );
  } );

  describe( "when there is no local observation with the resource_uuid", ( ) => {
    beforeEach( ( ) => {
      // Write mock observation to realm
      safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
        global.mockRealms[mockRealmIdentifier].create( "Observation", mockObservation );
      }, "write mock observation, useObservationUpdates test" );
    } );

    it( "should return without writing to a local observation", ( ) => {
      const { result } = renderHook( ( ) => useObservationsUpdates( ) );
      const observation = global.mockRealms[mockRealmIdentifier]
        .objectForPrimaryKey( "Observation", mockObservation.uuid );
      expect( mockCommentUpdate.resource_uuid ).not.toEqual( observation.uuid );
      expect( mockIdentificationUpdate.resource_uuid ).not.toEqual( observation.uuid );
      expect( result.current.refetch ).toEqual( undefined );
    } );
  } );

  describe.each( [
    ["comment", [mockCommentUpdate]],
    ["identification", [mockIdentificationUpdate]],
    ["both", mockData],
  ] )( "when the update is a %s", ( ) => {
    describe.each( [
      ["viewed fields not initialized", null, null],
      ["viewed comments and viewed identifications", true, true],
      ["viewed comments and not viewed identifications", true, false],
      ["not viewed comments and viewed identifications", false, true],
      ["not viewed comments and not viewed identifications", false, false],
    ] )( "when the local observation has %s", ( a1, viewedComments, viewedIdentifications ) => {
      beforeEach( ( ) => {
      // Write mock observation to realm
        safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
          global.mockRealms[mockRealmIdentifier].deleteAll( );
          global.mockRealms[mockRealmIdentifier].create( "Observation", {
            ...mockObservation,
            comments_viewed: viewedComments,
            identifications_viewed: viewedIdentifications,
          } );
        }, "delete all and create observation, useObservationsUpdates test" );
      } );

      it( "should write correct viewed status for comments and identifications", ( ) => {
        renderHook( ( ) => useObservationsUpdates( mockUser ) );
        const observation = global.mockRealms[mockRealmIdentifier].objects( "Observation" )[0];
        expect( observation.comments_viewed ).toEqual( viewedComments );
        expect( observation.identifications_viewed ).toEqual( viewedIdentifications );
      } );
    } );
  } );
} );
