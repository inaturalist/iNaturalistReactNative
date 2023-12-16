import { renderHook } from "@testing-library/react-native";
import { useCurrentUser } from "sharedHooks";
import factory from "tests/factory";

const mockUser = factory( "LocalUser", {
  login: "fake_login",
  signedIn: true
} );

describe( "useCurrentUser", () => {
  beforeEach( async ( ) => {
    // Write mock observations to realm
    await global.realm.write( () => {
      global.realm.create( "User", mockUser );
    } );
  } );

  it( "should return current user", () => {
    const { result } = renderHook( () => useCurrentUser() );
    const user = global.realm.objects( "User" ).filtered( "signedIn == true" )[0];
    expect( user.login ).toEqual( result.current.login );
  } );
} );
