import { renderHook } from "@testing-library/react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useCurrentUser } from "sharedHooks";
import factory from "tests/factory";
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

const mockUser = factory( "LocalUser", {
  login: "fake_login",
  signedIn: true,
} );

describe( "useCurrentUser", () => {
  beforeEach( async ( ) => {
    // Write mock user to realm
    safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
      global.mockRealms[mockRealmIdentifier].create( "User", mockUser );
    }, "create current user, useCurrentUser test" );
  } );

  it( "should return current user", () => {
    const { result } = renderHook( () => useCurrentUser() );
    const user = global.mockRealms[mockRealmIdentifier]
      .objects( "User" )
      .filtered( "signedIn == true" )[0];
    expect( user.login ).toEqual( result.current.login );
  } );
} );
