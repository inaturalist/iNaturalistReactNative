import useStore from "stores/useStore";

const initialStoreState = useStore.getState( );

const getRecents = ( ) => useStore.getState( ).recentLocationSearches;
const addRecent = place => useStore.getState( ).addRecentLocationSearch( place );

beforeEach( ( ) => {
  useStore.setState( initialStoreState, true );
} );

describe( "recentLocationSearches slice", ( ) => {
  it( "starts empty", ( ) => {
    expect( getRecents( ) ).toEqual( [] );
  } );

  it( "adds a search to the front of the list", ( ) => {
    addRecent( { id: 1, display_name: "Monterey, CA, US" } );
    addRecent( { id: 2, display_name: "Oakland, CA, US" } );

    expect( getRecents( ).map( p => p.id ) ).toEqual( [2, 1] );
  } );

  it( "de-duplicates by id and moves the repeat to the front", ( ) => {
    addRecent( { id: 1, display_name: "Monterey, CA, US" } );
    addRecent( { id: 2, display_name: "Oakland, CA, US" } );
    addRecent( { id: 1, display_name: "Monterey, CA, US" } );

    expect( getRecents( ).map( p => p.id ) ).toEqual( [1, 2] );
  } );

  it( "caps the list at 5 entries, dropping the oldest", ( ) => {
    [1, 2, 3, 4, 5, 6].forEach( id => addRecent( { id, display_name: `Place ${id}` } ) );

    expect( getRecents( ).map( p => p.id ) ).toEqual( [6, 5, 4, 3, 2] );
  } );
} );
