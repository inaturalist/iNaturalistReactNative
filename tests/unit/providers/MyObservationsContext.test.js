import { initialMyObservationsState } from "providers/MyObservationsContext";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import useStore from "stores/useStore";

const initialStoreState = useStore.getState( );

describe( "initialMyObservationsState", ( ) => {
  it( "starts with obs sorted by date uploaded (newest), species sort desc, and no taxon", ( ) => {
    expect( initialMyObservationsState.observationsSort )
      .toBe( OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST );
    expect( initialMyObservationsState.speciesSort ).toBe( SPECIES_SORT.COUNT_DESC );
    expect( initialMyObservationsState.searchedTaxon ).toBeNull( );
  } );
} );

describe( "closed iconic taxa categories", ( ) => {
  beforeEach( ( ) => {
    useStore.setState( initialStoreState, true );
    useStore.getState( ).setMyObservationsClosedIconicTaxaCategories(
      new Set( [ICONIC_TAXA_GROUP.AVES] ),
    );
  } );

  it( "reopens every category when the searched taxon changes", ( ) => {
    useStore.getState( ).updateMyObservations( previous => ( {
      ...previous,
      searchedTaxon: { id: 1, name: "Aves" },
    } ) );

    expect( useStore.getState( ).myObservationsClosedIconicTaxaCategories.size ).toBe( 0 );
  } );
} );
