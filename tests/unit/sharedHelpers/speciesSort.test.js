import {
  EXPLORE_SPECIES_SORT_OPTIONS,
  isSpeciesCountsSort,
  SPECIES_SORT,
  speciesSortToSpeciesCountsParams,
  speciesSortToTaxaObservedParams,
} from "sharedHelpers/speciesSort";

describe( "speciesSort", ( ) => {
  describe( "API params", ( ) => {
    it( "maps count sorts to species_counts params", ( ) => {
      expect( speciesSortToSpeciesCountsParams( SPECIES_SORT.COUNT_DESC ) )
        .toEqual( { order_by: "count", order: "desc" } );
      expect( speciesSortToSpeciesCountsParams( SPECIES_SORT.COUNT_ASC ) )
        .toEqual( { order_by: "count", order: "asc" } );
    } );

    it( "maps date sorts to taxa_observed params", ( ) => {
      expect( speciesSortToTaxaObservedParams( SPECIES_SORT.DATE_OBSERVED_NEWEST ) )
        .toEqual( { order_by: "first_observed_on", order: "desc" } );
      expect( speciesSortToTaxaObservedParams( SPECIES_SORT.DATE_OBSERVED_OLDEST ) )
        .toEqual( { order_by: "first_observed_on", order: "asc" } );
    } );

    it( "only treats count sorts as species_counts sorts", ( ) => {
      expect( isSpeciesCountsSort( SPECIES_SORT.COUNT_DESC ) ).toBe( true );
      expect( isSpeciesCountsSort( SPECIES_SORT.COUNT_ASC ) ).toBe( true );
      expect( isSpeciesCountsSort( SPECIES_SORT.DATE_OBSERVED_NEWEST ) ).toBe( false );
      expect( isSpeciesCountsSort( SPECIES_SORT.DATE_OBSERVED_OLDEST ) ).toBe( false );
    } );

    it( "does not offer date sorts in Explore", ( ) => {
      expect( EXPLORE_SPECIES_SORT_OPTIONS ).toEqual( [
        SPECIES_SORT.COUNT_DESC,
        SPECIES_SORT.COUNT_ASC,
      ] );
    } );
  } );
} );
