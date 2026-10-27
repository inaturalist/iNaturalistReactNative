import {
  EXPLORE_SPECIES_SORT_OPTIONS,
  isSpeciesCountsSort,
  sortSpeciesCounts,
  SPECIES_SORT,
  speciesSortToSpeciesCountsParams,
  speciesSortToTaxaObservedParams,
} from "sharedHelpers/speciesSort";

const speciesCount = ( taxonId, count, firstObservedOn ) => ( {
  count,
  taxon: { id: taxonId },
  first_observed_on: firstObservedOn,
} );

const taxonIds = speciesCounts => speciesCounts.map( s => s.taxon.id );

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

  describe( "sortSpeciesCounts", ( ) => {
    const speciesCounts = [
      speciesCount( 1, 5, "2024-03-01" ),
      speciesCount( 2, 9, null ),
      speciesCount( 3, 1, "2026-10-09" ),
      speciesCount( 4, 3, "2015-06-20" ),
    ];

    it( "sorts by count, most observed first", ( ) => {
      expect( taxonIds( sortSpeciesCounts( speciesCounts, SPECIES_SORT.COUNT_DESC ) ) )
        .toEqual( [2, 1, 4, 3] );
    } );

    it( "sorts by count, least observed first", ( ) => {
      expect( taxonIds( sortSpeciesCounts( speciesCounts, SPECIES_SORT.COUNT_ASC ) ) )
        .toEqual( [3, 4, 1, 2] );
    } );

    it( "sorts by first observed date, newest first, with missing dates last", ( ) => {
      expect( taxonIds( sortSpeciesCounts( speciesCounts, SPECIES_SORT.DATE_OBSERVED_NEWEST ) ) )
        .toEqual( [3, 1, 4, 2] );
    } );

    it( "sorts by first observed date, oldest first, with missing dates last", ( ) => {
      expect( taxonIds( sortSpeciesCounts( speciesCounts, SPECIES_SORT.DATE_OBSERVED_OLDEST ) ) )
        .toEqual( [4, 1, 3, 2] );
    } );

    it( "breaks first observed date ties by taxon id ascending in both directions", ( ) => {
      const sameDay = [
        speciesCount( 30, 1, "2026-10-09" ),
        speciesCount( 10, 1, "2026-10-09" ),
        speciesCount( 20, 1, "2026-10-09" ),
      ];
      expect( taxonIds( sortSpeciesCounts( sameDay, SPECIES_SORT.DATE_OBSERVED_NEWEST ) ) )
        .toEqual( [10, 20, 30] );
      expect( taxonIds( sortSpeciesCounts( sameDay, SPECIES_SORT.DATE_OBSERVED_OLDEST ) ) )
        .toEqual( [10, 20, 30] );
    } );

    it( "treats an undefined first observed date like a missing one", ( ) => {
      const noDates = [
        speciesCount( 2, 1, undefined ),
        speciesCount( 1, 1, "2020-01-01" ),
      ];
      expect( taxonIds( sortSpeciesCounts( noDates, SPECIES_SORT.DATE_OBSERVED_NEWEST ) ) )
        .toEqual( [1, 2] );
    } );

    it( "does not mutate the input", ( ) => {
      const input = [...speciesCounts];
      sortSpeciesCounts( input, SPECIES_SORT.DATE_OBSERVED_NEWEST );
      expect( input ).toEqual( speciesCounts );
    } );
  } );
} );
