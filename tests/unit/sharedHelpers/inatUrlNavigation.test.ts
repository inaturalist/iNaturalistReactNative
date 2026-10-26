import { StackActions } from "@react-navigation/native";
import {
  openInatUrl,
  parseInatUrl,
} from "sharedHelpers/inatUrlNavigation";

describe( "parseInatUrl", ( ) => {
  it( "parses a people login URL as a user target", ( ) => {
    expect( parseInatUrl( "https://www.inaturalist.org/people/example" ) ).toEqual( {
      type: "user",
      login: "example",
    } );
  } );

  it( "parses a numeric people URL as a userId target", ( ) => {
    expect( parseInatUrl( "https://www.inaturalist.org/people/123" ) ).toEqual( {
      type: "user",
      userId: 123,
    } );
  } );

  it( "returns null for a non-iNaturalist host", ( ) => {
    expect( parseInatUrl( "https://example.com/people/example" ) ).toBeNull( );
  } );
} );

describe( "openInatUrl", ( ) => {
  it( "pushes UserProfile with login for a people login URL", async ( ) => {
    const dispatch = jest.fn( );
    const navigation = { dispatch } as never;

    const handled = await openInatUrl(
      { type: "user", login: "example" },
      navigation,
    );

    expect( handled ).toBe( true );
    expect( dispatch ).toHaveBeenCalledWith(
      StackActions.push( "UserProfile", { login: "example" } ),
    );
  } );

  it( "pushes UserProfile with userId for a numeric people URL", async ( ) => {
    const dispatch = jest.fn( );
    const navigation = { dispatch } as never;

    const handled = await openInatUrl(
      { type: "user", userId: 123 },
      navigation,
    );

    expect( handled ).toBe( true );
    expect( dispatch ).toHaveBeenCalledWith(
      StackActions.push( "UserProfile", { userId: 123 } ),
    );
  } );
} );
