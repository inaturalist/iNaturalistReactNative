import { renderHook } from "@testing-library/react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useObservationUpdatesWhenFocused from "sharedHooks/useObservationUpdatesWhenFocused";
import factory from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

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

jest.mock( "react-native/Libraries/AppState/AppState", () => ( {
  addEventListener: jest.fn( ( event, callback ) => {
    callback( "active" );
  } )
} ) );

const mockObservations = [
  factory( "LocalObservation", { comments_viewed: false, identifications_viewed: false } ),
  factory( "LocalObservation", { comments_viewed: true, identifications_viewed: false } ),
  factory( "LocalObservation", { comments_viewed: false, identifications_viewed: true } ),
  factory( "LocalObservation", { comments_viewed: true, identifications_viewed: true } )
];

describe( "useObservationUpdatesWhenFocused", () => {
  beforeAll( ( ) => {
    // Write mock observations to realm
    safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
      mockObservations.forEach( o => {
        global.mockRealms[mockRealmIdentifier].create( "Observation", o );
      } );
    }, "write observations to realm, useObservationUpdatesWhenFocused test" );
  } );

  it( "should reset state of all observations in realm", () => {
    renderHook( () => useObservationUpdatesWhenFocused() );
    const observations = global.mockRealms[mockRealmIdentifier].objects( "Observation" );
    observations.forEach( o => {
      expect( o.comments_viewed ).toBe( true );
      expect( o.identifications_viewed ).toBe( true );
    } );
  } );
} );
