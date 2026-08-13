import type { SmallGridItem } from "components/SharedComponents/SmallGrid";
import { computeTilePositions } from "components/SharedComponents/SmallGrid";

type Row = SmallGridItem<string, string, string>;

const header = ( key: string ): Row => ( { type: "header", key, header: key } );
const tile = ( key: string ): Row => ( { type: "tile", key, tile: key } );
const span = ( key: string, itemType?: string ): Row => ( {
  type: "span", key, itemType, content: key,
} );

describe( "computeTilePositions", ( ) => {
  it( "numbers tiles from zero within a section", ( ) => {
    const data = [header( "h" ), tile( "a" ), tile( "b" ), tile( "c" )];

    const positions = computeTilePositions( data );

    expect( positions.get( 1 ) ).toBe( 0 );
    expect( positions.get( 2 ) ).toBe( 1 );
    expect( positions.get( 3 ) ).toBe( 2 );
  } );

  it( "restarts numbering after a header so each section begins a fresh row", ( ) => {
    const data = [
      header( "h1" ), tile( "a" ), tile( "b" ),
      header( "h2" ), tile( "c" ),
    ];

    const positions = computeTilePositions( data );

    expect( positions.get( 2 ) ).toBe( 1 );
    expect( positions.get( 4 ) ).toBe( 0 );
  } );

  it( "restarts numbering after a span row, which also takes up a whole row", ( ) => {
    const data = [
      header( "h" ), tile( "a" ), tile( "b" ),
      span( "loading" ),
      tile( "c" ), tile( "d" ),
    ];

    const positions = computeTilePositions( data );

    expect( positions.get( 2 ) ).toBe( 1 );
    expect( positions.get( 4 ) ).toBe( 0 );
    expect( positions.get( 5 ) ).toBe( 1 );
  } );

  it( "does not assign a position to non-tile rows", ( ) => {
    const data = [header( "h" ), tile( "a" ), span( "loading" )];

    const positions = computeTilePositions( data );

    expect( positions.has( 0 ) ).toBe( false );
    expect( positions.has( 2 ) ).toBe( false );
    expect( positions.size ).toBe( 1 );
  } );

  it( "returns an empty map for an empty list", ( ) => {
    expect( computeTilePositions( [] ).size ).toBe( 0 );
  } );
} );
