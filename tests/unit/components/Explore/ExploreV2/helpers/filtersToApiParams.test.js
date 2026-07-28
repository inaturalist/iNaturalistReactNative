import filtersToApiParams from "components/Explore/ExploreV2/helpers/filtersToApiParams";
import {
  ESTABLISHMENT_MEAN,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  WILD_STATUS,
} from "providers/ExploreContext";
import { defaultExploreV2Filters } from "providers/ExploreV2Context";

const makeFilters = overrides => ( { ...defaultExploreV2Filters, ...overrides } );

describe( "filtersToApiParams", ( ) => {
  it( "maps only the default quality grade for default filters", ( ) => {
    expect( filtersToApiParams( defaultExploreV2Filters ) ).toEqual( {
      quality_grade: ["research", "needs_id"],
    } );
  } );

  describe( "quality grade", ( ) => {
    it( "maps all three grades in order", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        researchGrade: true,
        needsID: true,
        casual: true,
      } ) );
      expect( params.quality_grade ).toEqual( ["research", "needs_id", "casual"] );
    } );

    it( "maps casual only", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        researchGrade: false,
        needsID: false,
        casual: true,
      } ) );
      expect( params.quality_grade ).toEqual( ["casual"] );
    } );

    it( "omits quality_grade when no grade is selected", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        researchGrade: false,
        needsID: false,
        casual: false,
      } ) );
      expect( params ).not.toHaveProperty( "quality_grade" );
    } );
  } );

  describe( "taxonomic ranks", ( ) => {
    it( "maps hrank and lrank when set", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        hrank: "family",
        lrank: "species",
      } ) );
      expect( params.hrank ).toBe( "family" );
      expect( params.lrank ).toBe( "species" );
    } );
  } );

  describe( "date observed", ( ) => {
    it( "maps an exact observed date", ( ) => {
      const params = filtersToApiParams( makeFilters( { observed_on: "2024-05-01" } ) );
      expect( params.observed_on ).toBe( "2024-05-01" );
    } );

    it( "maps an observed date range", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        d1: "2024-01-01",
        d2: "2024-12-31",
      } ) );
      expect( params.d1 ).toBe( "2024-01-01" );
      expect( params.d2 ).toBe( "2024-12-31" );
    } );

    it( "maps selected months", ( ) => {
      const params = filtersToApiParams( makeFilters( { months: [3, 4, 5] } ) );
      expect( params.month ).toEqual( [3, 4, 5] );
    } );
  } );

  describe( "date uploaded", ( ) => {
    it( "maps an exact created date", ( ) => {
      const params = filtersToApiParams( makeFilters( { created_on: "2024-06-15" } ) );
      expect( params.created_on ).toBe( "2024-06-15" );
    } );

    it( "maps a created date range", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        created_d1: "2024-01-01",
        created_d2: "2024-06-30",
      } ) );
      expect( params.created_d1 ).toBe( "2024-01-01" );
      expect( params.created_d2 ).toBe( "2024-06-30" );
    } );
  } );

  describe( "media", ( ) => {
    it( "maps PHOTOS to photos:true only", ( ) => {
      const params = filtersToApiParams( makeFilters( { media: MEDIA.PHOTOS } ) );
      expect( params.photos ).toBe( true );
      expect( params ).not.toHaveProperty( "sounds" );
    } );

    it( "maps SOUNDS to sounds:true only", ( ) => {
      const params = filtersToApiParams( makeFilters( { media: MEDIA.SOUNDS } ) );
      expect( params.sounds ).toBe( true );
      expect( params ).not.toHaveProperty( "photos" );
    } );

    it( "maps NONE to photos:false and sounds:false", ( ) => {
      const params = filtersToApiParams( makeFilters( { media: MEDIA.NONE } ) );
      expect( params.photos ).toBe( false );
      expect( params.sounds ).toBe( false );
    } );
  } );

  describe( "establishment mean", ( ) => {
    it.each( [
      [ESTABLISHMENT_MEAN.NATIVE, "native"],
      [ESTABLISHMENT_MEAN.INTRODUCED, "introduced"],
      [ESTABLISHMENT_MEAN.ENDEMIC, "endemic"],
    ] )( "maps %s to %s:true", ( establishmentMean, key ) => {
      const params = filtersToApiParams( makeFilters( { establishmentMean } ) );
      expect( params[key] ).toBe( true );
    } );
  } );

  describe( "wild status", ( ) => {
    it.each( [
      [WILD_STATUS.WILD, false],
      [WILD_STATUS.CAPTIVE, true],
    ] )( "maps %s to captive:%s", ( wildStatus, expected ) => {
      const params = filtersToApiParams( makeFilters( { wildStatus } ) );
      expect( params.captive ).toBe( expected );
    } );
  } );

  describe( "reviewed", ( ) => {
    it( "maps REVIEWED with a viewer id", ( ) => {
      const params = filtersToApiParams(
        makeFilters( { reviewedFilter: REVIEWED.REVIEWED } ),
        42,
      );
      expect( params.reviewed ).toBe( true );
      expect( params.viewer_id ).toBe( 42 );
    } );

    it( "maps UNREVIEWED with a viewer id", ( ) => {
      const params = filtersToApiParams(
        makeFilters( { reviewedFilter: REVIEWED.UNREVIEWED } ),
        42,
      );
      expect( params.reviewed ).toBe( false );
      expect( params.viewer_id ).toBe( 42 );
    } );

    it( "omits reviewed params when there is no viewer id", ( ) => {
      const params = filtersToApiParams(
        makeFilters( { reviewedFilter: REVIEWED.REVIEWED } ),
      );
      expect( params ).not.toHaveProperty( "reviewed" );
      expect( params ).not.toHaveProperty( "viewer_id" );
    } );

    it( "omits reviewed params for ALL even with a viewer id", ( ) => {
      const params = filtersToApiParams(
        makeFilters( { reviewedFilter: REVIEWED.ALL } ),
        42,
      );
      expect( params ).not.toHaveProperty( "reviewed" );
      expect( params ).not.toHaveProperty( "viewer_id" );
    } );
  } );

  describe( "photo license", ( ) => {
    it.each( [
      [PHOTO_LICENSE.CC0, "cc0"],
      [PHOTO_LICENSE.CCBY, "cc-by"],
      [PHOTO_LICENSE.CCBYNC, "cc-by-nc"],
      [PHOTO_LICENSE.CCBYSA, "cc-by-sa"],
      [PHOTO_LICENSE.CCBYND, "cc-by-nd"],
      [PHOTO_LICENSE.CCBYNCSA, "cc-by-nc-sa"],
      [PHOTO_LICENSE.CCBYNCND, "cc-by-nc-nd"],
    ] )( "maps %s to %s", ( license, expected ) => {
      const params = filtersToApiParams( makeFilters( { photoLicense: license } ) );
      expect( params.photo_license ).toBe( expected );
    } );
  } );

  describe( "iconic taxa", ( ) => {
    it( "maps a non-empty iconic_taxa array", ( ) => {
      const params = filtersToApiParams( makeFilters( { iconic_taxa: ["Aves", "Insecta"] } ) );
      expect( params.iconic_taxa ).toEqual( ["Aves", "Insecta"] );
    } );
  } );

  describe( "user and project", ( ) => {
    it( "maps user id and project id", ( ) => {
      const params = filtersToApiParams( makeFilters( {
        user: { id: 7 },
        project: { id: 9 },
      } ) );
      expect( params.user_id ).toBe( 7 );
      expect( params.project_id ).toBe( 9 );
    } );
  } );
} );
