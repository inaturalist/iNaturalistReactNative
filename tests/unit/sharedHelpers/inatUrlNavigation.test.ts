import { StackActions } from "@react-navigation/native";
import {
  openInatUrl,
  parseInatUrl,
} from "sharedHelpers/inatUrlNavigation";

describe( "parseInatUrl", ( ) => {
  it( "parses a people login URL as a user target", ( ) => {
    expect( parseInatUrl( "https://www.inaturalist.org/people/example" ) ).toEqual( {
      type: "user",
      id: "example",
    } );
  } );

  it( "parses a numeric people URL as a user target with a numeric id segment", ( ) => {
    expect( parseInatUrl( "https://www.inaturalist.org/people/123" ) ).toEqual( {
      type: "user",
      id: "123",
    } );
  } );

  it( "returns null for a non-iNaturalist host", ( ) => {
    expect( parseInatUrl( "https://example.com/people/example" ) ).toBeNull( );
  } );

  it( "returns null for deeper /people/ member routes", ( ) => {
    expect(
      parseInatUrl( "https://www.inaturalist.org/people/example/followers" ),
    ).toBeNull( );
    expect(
      parseInatUrl( "https://www.inaturalist.org/people/example/following" ),
    ).toBeNull( );
  } );

  it( "returns null for reserved /people/ collection routes", ( ) => {
    expect( parseInatUrl( "https://www.inaturalist.org/people/new" ) ).toBeNull( );
    expect(
      parseInatUrl( "https://www.inaturalist.org/people/leaderboard" ),
    ).toBeNull( );
  } );
} );

describe( "openInatUrl", ( ) => {
  it( "does not handle a people login URL in-app", async ( ) => {
    const dispatch = jest.fn( );
    const navigation = { dispatch } as never;

    const handled = await openInatUrl(
      { type: "user", id: "example" },
      navigation,
    );

    expect( handled ).toBe( false );
    expect( dispatch ).not.toHaveBeenCalled( );
  } );

  it( "pushes UserProfile with userId for a numeric people URL", async ( ) => {
    const dispatch = jest.fn( );
    const navigation = { dispatch } as never;

    const handled = await openInatUrl(
      { type: "user", id: "123" },
      navigation,
    );

    expect( handled ).toBe( true );
    expect( dispatch ).toHaveBeenCalledWith(
      StackActions.push( "UserProfile", { userId: 123 } ),
    );
  } );
} );
