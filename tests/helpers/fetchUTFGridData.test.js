import getDataForPixel from "sharedHelpers/fetchUTFGridData";

const UTF_GRID_JSON = {
  // eslint-disable-next-line max-len
  grid: ["       ! # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B                                                        "],
  keys: ["1234"],
  data: {
    1234: {
      captive: null,
      cellCount: 1,
      geoprivacy: "obscured",
      id: 1234,
      latitude: 36.1234,
      longitude: -121.1234,
      private_location: true,
      quality_grade: "research",
      "taxon.iconic_taxon_id": 1,
      uuid: "this-is-a-uuid",
    },
  },
};

describe( "getDataForPixel", ( ) => {
  it( "should return null if grid is undefined", ( ) => {
    expect( getDataForPixel( 0, 0, { ...UTF_GRID_JSON, grid: undefined } ) ).toBeNull( );
  } );
  it( "should return null if data is undefined", ( ) => {
    expect( getDataForPixel( 0, 0, { ...UTF_GRID_JSON, data: undefined } ) ).toBeNull( );
  } );
  it( "should return null if json is undefined", ( ) => {
    expect( getDataForPixel( 0, 0, undefined ) ).toBeNull( );
  } );
} );
