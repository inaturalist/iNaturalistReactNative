import { initialMyObservationsState } from "providers/MyObservationsContext";
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

describe( "the stored map region", ( ) => {
  const REGION = {
    latitude: 10,
    longitude: 20,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  beforeEach( ( ) => {
    useStore.setState( initialStoreState, true );
    useStore.getState( ).setMyObservationsMapRegion( REGION );
  } );

  it( "is dropped when the searched taxon changes, so the map refits to the new "
    + "taxon's bounds", ( ) => {
    useStore.getState( ).updateMyObservations( previous => ( {
      ...previous,
      searchedTaxon: { id: 1, name: "Aves" },
    } ) );

    expect( useStore.getState( ).myObservationsMapRegion ).toBeNull( );
  } );

  it( "survives changes that are not a new search", ( ) => {
    useStore.getState( ).updateMyObservations( previous => ( {
      ...previous,
      speciesSort: SPECIES_SORT.COUNT_ASC,
    } ) );

    expect( useStore.getState( ).myObservationsMapRegion ).toEqual( REGION );
  } );
} );
