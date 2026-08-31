import savedSearchKey from "components/Explore/ExploreV2/helpers/savedSearchKey";
import { defaultExploreV2Filters, EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import { place, savedSearch as search, taxonSubject } from "tests/helpers/savedSearch";

describe( "savedSearchKey", ( ) => {
  it( "gives two identical searches the same key", ( ) => {
    expect( savedSearchKey( search( ) ) ).toEqual( savedSearchKey( search( ) ) );
  } );

  it( "changes when the subject, the location, or any filter changes", ( ) => {
    const base = savedSearchKey( search( ) );

    expect( savedSearchKey( search( { subject: taxonSubject( 13 ) } ) ) ).not.toEqual( base );
    expect( savedSearchKey( search( {
      location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: place( 1 ) },
    } ) ) ).not.toEqual( base );
    expect( savedSearchKey( search( {
      filters: { ...defaultExploreV2Filters, casual: true },
    } ) ) ).not.toEqual( base );
  } );

  it( "ignores sort order, so the same search under a different sort is the same search", ( ) => {
    expect( savedSearchKey( search( {
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      speciesSortBy: SPECIES_SORT.COUNT_ASC,
    } ) ) ).toEqual( savedSearchKey( search( ) ) );
  } );

  it( "tells apart a search with no subject and one for unobserved species", ( ) => {
    const noSubject = savedSearchKey( search( { subject: null } ) );
    const unobserved = savedSearchKey( search( {
      subject: { type: "unobserved", user: { id: 7 } },
    } ) );

    expect( noSubject ).not.toEqual( unobserved );
    expect( noSubject ).toEqual( savedSearchKey( search( { subject: null } ) ) );
  } );

  it( "rounds map area bounds, so an imperceptible pan is still the same search", ( ) => {
    const mapArea = bounds => search( {
      location: { placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA, bounds },
    } );
    const base = mapArea( {
      swlat: 44.9, swlng: -93.3, nelat: 45.1, nelng: -93.1,
    } );

    expect( savedSearchKey( mapArea( {
      swlat: 44.900001, swlng: -93.3, nelat: 45.1, nelng: -93.1,
    } ) ) ).toEqual( savedSearchKey( base ) );
    expect( savedSearchKey( mapArea( {
      swlat: 44.8, swlng: -93.3, nelat: 45.1, nelng: -93.1,
    } ) ) ).not.toEqual( savedSearchKey( base ) );
  } );

  it( "does not care what order the months came in", ( ) => {
    const months = value => search( { filters: { ...defaultExploreV2Filters, months: value } } );

    expect( savedSearchKey( months( [3, 1, 2] ) ) )
      .toEqual( savedSearchKey( months( [1, 2, 3] ) ) );
  } );
} );
