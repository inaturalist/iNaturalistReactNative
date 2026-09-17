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

describe( "the closed iconic taxa categories", ( ) => {
  const CLOSED = new Set( [ICONIC_TAXA_GROUP.AVES] );

  const closedCategories = ( ) => useStore.getState( ).myObservationsClosedIconicTaxaCategories;

  beforeEach( ( ) => {
    useStore.setState( initialStoreState, true );
    useStore.getState( ).setMyObservationsClosedIconicTaxaCategories( CLOSED );
  } );

  it( "starts with every section open", ( ) => {
    useStore.setState( initialStoreState, true );

    expect( initialStoreState.myObservationsClosedIconicTaxaCategories ).toEqual( new Set( ) );
  } );

  it( "survives a new search, unlike the map region", ( ) => {
    useStore.getState( ).updateMyObservations( previous => ( {
      ...previous,
      searchedTaxon: { id: 1, name: "Aves" },
    } ) );

    expect( closedCategories( ) ).toEqual( CLOSED );
    expect( useStore.getState( ).myObservationsMapRegion ).toBeNull( );
  } );

  it( "survives a sort change, since sections are categories and sorting only reorders "
    + "the observations within one", ( ) => {
    useStore.getState( ).updateMyObservations( previous => ( {
      ...previous,
      observationsSort: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
    } ) );

    expect( closedCategories( ) ).toEqual( CLOSED );
  } );

  it( "is dropped along with the map region when the user switches views", ( ) => {
    useStore.getState( ).setMyObservationsMapRegion( {
      latitude: 10,
      longitude: 20,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    } );

    useStore.getState( ).clearMyObservationsViewState( );

    expect( closedCategories( ) ).toEqual( new Set( ) );
    expect( useStore.getState( ).myObservationsMapRegion ).toBeNull( );
  } );
} );
