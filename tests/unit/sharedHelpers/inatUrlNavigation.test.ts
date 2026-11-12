import { StackActions } from "@react-navigation/native";
import { openInatUrl, parseInatUrl } from "sharedHelpers/inatUrlNavigation";

const HOST = "https://www.inaturalist.org";

describe( "parseInatUrl", ( ) => {
  it.each( [
    [`${HOST}/blog/12345`, "12345"],
    [`${HOST}/posts/12345`, "12345"],
    [`${HOST}/journal/some-user/12345`, "12345"],
    [`${HOST}/projects/city-nature/journal/12345`, "12345"],
    [`${HOST}/blog/12345-some-title`, "12345-some-title"],
  ] )( "recognizes %s as post %s", ( href, id ) => {
    expect( parseInatUrl( href ) ).toEqual( { type: "post", id } );
  } );

  it.each( [
    `${HOST}/blog`,
    `${HOST}/journal`,
    `${HOST}/journal/some-user`,
    `${HOST}/projects/city-nature/journal`,
    `${HOST}/blog/archives/2024/3`,
    `${HOST}/blog/new`,
    `${HOST}/journal/some-user/archives`,
    `${HOST}/journal/some-user/new`,
    `${HOST}/projects/city-nature/journal/archives/2024/3`,
    `${HOST}/projects/city-nature/journal/new`,
    `${HOST}/posts/12345/edit`,
    `${HOST}/journal/some-user/12345/edit`,
    `${HOST}/blog/12345/edit`,
    `${HOST}/projects/city-nature/journal/12345/edit`,
  ] )( "leaves %s for the browser", href => {
    expect( parseInatUrl( href ) ).toBeNull( );
  } );

  it( "keeps a project page as a project", ( ) => {
    expect( parseInatUrl( `${HOST}/projects/city-nature` ) ).toEqual( {
      type: "project",
      id: "city-nature",
    } );
  } );
} );

describe( "openInatUrl", ( ) => {
  it( "pushes PostDetails with the numeric id", async ( ) => {
    const dispatch = jest.fn( );
    const navigation = { dispatch };
    const parsed = parseInatUrl( `${HOST}/journal/some-user/12345-some-title` );

    if ( !parsed ) {
      throw new Error( "expected a post link" );
    }

    await expect( openInatUrl( parsed, navigation ) ).resolves.toBe( true );
    expect( dispatch ).toHaveBeenCalledWith(
      StackActions.push( "PostDetails", { id: 12345 } ),
    );
  } );
} );
