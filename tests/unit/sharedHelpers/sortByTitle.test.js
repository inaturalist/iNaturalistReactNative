import sortByTitle from "sharedHelpers/sortByTitle";

const item = ( id, title ) => ( { id, title } );
const ids = items => items.map( entry => entry.id );

describe( "sortByTitle", ( ) => {
  it( "orders by title case-insensitively and puts untitled items last", ( ) => {
    expect( ids( sortByTitle( [
      item( 1, "Banana" ),
      item( 2, "apple" ),
      item( 3, "" ),
    ], "en" ) ) ).toEqual( [2, 1, 3] );
  } );

  it( "orders titles with the given locale", ( ) => {
    const items = [
      item( 1, "zebra" ),
      item( 2, "apple" ),
      item( 3, "äpple" ),
    ];

    expect( ids( sortByTitle( items, "sv" ) ) ).toEqual( [2, 1, 3] );
    expect( ids( sortByTitle( items, "de" ) ) ).toEqual( [2, 3, 1] );
  } );

  it( "trims titles and breaks ties by id", ( ) => {
    expect( ids( sortByTitle( [
      item( 20, "Apple" ),
      item( 5, "  apple" ),
      item( 1, "   " ),
    ], "en" ) ) ).toEqual( [5, 20, 1] );
  } );

  it( "sorts when the locale is not a collation locale", ( ) => {
    const items = [
      item( 2, "Banana" ),
      item( 1, "apple" ),
    ];

    expect( ids( sortByTitle( items, "zh_TW" ) ) ).toEqual( [1, 2] );
  } );
} );
