import { StackActions } from "@react-navigation/native";
import { openInatUrl, parseInatUrl } from "sharedHelpers/inatUrlNavigation";

const HOST = "https://www.inaturalist.org";

describe( "parseInatUrl", ( ) => {
  it.each( [
    [`${HOST}/blog/12345`, "12345"],
    [`${HOST}/posts/12345`, "12345"],
    [`${HOST}/posts/12345-some-title`, "12345-some-title"],
  ] )( "recognizes %s as post %s", ( href, id ) => {
    expect( parseInatUrl( href ) ).toEqual( { type: "post", id } );
  } );

  it.each( [
    `${HOST}/blog`,
    `${HOST}/blog/archives/2024/3`,
    `${HOST}/blog/new`,
    `${HOST}/posts/12345/edit`,
    `${HOST}/blog/12345/edit`,
    `${HOST}/journal/some-user/12345`,
  ] )( "leaves %s for the browser", href => {
    expect( parseInatUrl( href ) ).toBeNull( );
  } );

  it( "keeps a project journal link as a project", ( ) => {
    expect( parseInatUrl( `${HOST}/projects/city-nature/journal/12345` ) ).toEqual( {
      type: "project",
      id: "city-nature",
    } );
  } );
} );

describe( "openInatUrl", ( ) => {
  it( "pushes PostDetails with the numeric id", async ( ) => {
    const dispatch = jest.fn( );
    const navigation = { dispatch };
    const parsed = parseInatUrl( `${HOST}/blog/12345-some-title` );

    if ( !parsed ) {
      throw new Error( "expected a post link" );
    }

    await expect( openInatUrl( parsed, navigation ) ).resolves.toBe( true );
    expect( dispatch ).toHaveBeenCalledWith(
      StackActions.push( "PostDetails", { id: 12345 } ),
    );
  } );
} );
