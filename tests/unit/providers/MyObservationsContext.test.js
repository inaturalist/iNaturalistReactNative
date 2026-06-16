import { initialMyObservationsState } from "providers/MyObservationsContext";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";

describe( "initialMyObservationsState", ( ) => {
  it( "starts with obs sorted by date uploaded (newest), species sort desc, and no taxon", ( ) => {
    expect( initialMyObservationsState.observationsSort )
      .toBe( OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST );
    expect( initialMyObservationsState.speciesSort ).toBe( SPECIES_SORT.COUNT_DESC );
    expect( initialMyObservationsState.searchedTaxon ).toBeNull( );
  } );
} );
