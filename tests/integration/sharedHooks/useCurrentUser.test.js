import { act, renderHook, waitFor } from "@testing-library/react-native";
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
  prefers_common_names: false,
  prefers_scientific_name_first: false,
} );

const signedInUser = ( ) => global.mockRealms[mockRealmIdentifier]
  .objects( "User" )
  .filtered( "signedIn == true" )[0];

describe( "useCurrentUser", () => {
  beforeEach( async ( ) => {
    // Write (or reset) the mock user
    safeRealmWrite( global.mockRealms[mockRealmIdentifier], ( ) => {
      global.mockRealms[mockRealmIdentifier].create( "User", mockUser, "modified" );
    }, "create current user, useCurrentUser test" );
  } );

  it( "should return current user", async ( ) => {
    const { result } = renderHook( () => useCurrentUser() );
    await waitFor( ( ) => {
      expect( signedInUser().login ).toEqual( result.current.login );
    } );
  } );

  it( "should return a detached snapshot, not a live Realm object", async ( ) => {
    const { result } = renderHook( () => useCurrentUser() );
    await waitFor( ( ) => {
      expect( result.current ).toBeTruthy();
    } );
    // A plain snapshot has no Realm object methods
    expect( result.current.isValid ).toBeUndefined();
    expect( result.current.login ).toEqual( "fake_login" );
  } );

  it( "should return null when no user is signed in", async ( ) => {
    const realm = global.mockRealms[mockRealmIdentifier];
    safeRealmWrite( realm, ( ) => {
      realm.delete( realm.objects( "User" ) );
    }, "delete users for logged-out test" );
    const { result } = renderHook( () => useCurrentUser() );
    await waitFor( ( ) => {
      expect( result.current ).toBeNull();
    } );
  } );

  it( "should keep the same snapshot reference when a write changes no fields", async ( ) => {
    const realm = global.mockRealms[mockRealmIdentifier];
    const { result } = renderHook( () => useCurrentUser() );
    const firstSnapshot = result.current;
    await act( async ( ) => {
      safeRealmWrite( realm, ( ) => {
        const user = signedInUser();
        // Re-assign identical values (a no-op write)
        const { login, name } = user;
        user.login = login;
        user.name = name;
      }, "no-op write" );
    } );
    expect( result.current ).toBe( firstSnapshot );
  } );

  it( "should return a new snapshot when a field genuinely changes", async ( ) => {
    const realm = global.mockRealms[mockRealmIdentifier];
    const { result } = renderHook( () => useCurrentUser() );
    const firstSnapshot = result.current;
    await act( async ( ) => {
      safeRealmWrite( realm, ( ) => {
        const user = signedInUser();
        user.prefers_common_names = !user.prefers_common_names;
      }, "change prefs" );
    } );
    await waitFor( ( ) => {
      expect( result.current ).not.toBe( firstSnapshot );
    } );
    expect( result.current.prefers_common_names ).toBe(
      !firstSnapshot.prefers_common_names,
    );
  } );
} );
