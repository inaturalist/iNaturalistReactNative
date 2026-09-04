import { defaultExploreV2Filters } from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import {
  addRecent,
  placeKey,
  RECENT_LIMIT,
  subjectKey,
} from "stores/createExploreV2SearchesSlice";
import useStore, { zustandStorage } from "stores/useStore";
import { place, savedSearch as search, taxonSubject } from "tests/helpers/savedSearch";

const recents = ( ) => useStore.getState( ).exploreRecentSearches;
const saved = ( ) => useStore.getState( ).exploreSavedSearches;

beforeEach( ( ) => {
  recents( ).clearRecents( );
  saved( ).clearSavedSearches( );
} );

describe( "subjectKey", ( ) => {
  it( "keys each subject type by its record", ( ) => {
    expect( subjectKey( taxonSubject( 12 ) ) ).toEqual( "taxon-12" );
    expect( subjectKey( { type: "user", user: { id: 7 } } ) ).toEqual( "user-7" );
    expect( subjectKey( { type: "project", project: { id: 9 } } ) ).toEqual( "project-9" );
    expect( subjectKey( { type: "unobserved", user: { id: 7 } } ) ).toEqual( "unobserved-7" );
    expect( subjectKey( { type: "unknown" } ) ).toEqual( "unknown" );
  } );
} );

describe( "addRecent", ( ) => {
  const keyFn = item => String( item.id );

  it( "puts the newest item first, bumping an existing item instead of duplicating it", ( ) => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }].reduce(
      ( memo, item ) => addRecent( memo, item, keyFn ),
      [],
    );

    expect( addRecent( items, { id: 2 }, keyFn ) ).toEqual( [{ id: 2 }, { id: 3 }, { id: 1 }] );
  } );

  it( "replaces the stored copy when the same item has newer data", ( ) => {
    const items = addRecent( [{ id: 1, name: "old" }], { id: 1, name: "new" }, keyFn );

    expect( items ).toEqual( [{ id: 1, name: "new" }] );
  } );

  it( "caps the list, dropping the oldest", ( ) => {
    const items = Array.from( { length: RECENT_LIMIT + 5 } ).reduce(
      ( memo, _item, i ) => addRecent( memo, { id: i }, keyFn ),
      [],
    );

    expect( items ).toHaveLength( RECENT_LIMIT );
    expect( items[0] ).toEqual( { id: RECENT_LIMIT + 4 } );
    expect( items.map( keyFn ) ).not.toContain( "0" );
  } );
} );

describe( "exploreRecentSearches", ( ) => {
  it( "records each list newest first, bumping a repeat instead of duplicating it", ( ) => {
    recents( ).recordSubject( taxonSubject( 1 ) );
    recents( ).recordSubject( taxonSubject( 2 ) );
    recents( ).recordSubject( taxonSubject( 1 ) );
    recents( ).recordPlace( place( 1 ) );
    recents( ).recordPlace( place( 2 ) );
    recents( ).recordPlace( place( 1 ) );

    // Each list keeps its own order, and recording one leaves the other alone
    const { places, subjects } = recents( );
    expect( subjects.map( subjectKey ) ).toEqual( ["taxon-1", "taxon-2"] );
    expect( places.map( placeKey ) ).toEqual( ["place-1", "place-2"] );
  } );

  it( "clears both lists", ( ) => {
    recents( ).recordSubject( taxonSubject( 12 ) );
    recents( ).recordPlace( place( 1 ) );

    recents( ).clearRecents( );

    expect( recents( ).subjects ).toEqual( [] );
    expect( recents( ).places ).toEqual( [] );
  } );

  it( "persists both lists, so they survive a restart", async ( ) => {
    recents( ).recordSubject( taxonSubject( 12 ) );
    recents( ).recordPlace( place( 1 ) );
    // let the persist middleware flush
    await Promise.resolve( );

    const persisted = JSON.parse( zustandStorage.getItem( "persisted-zustand" ) );
    expect( persisted.state.exploreRecentSearches ).toEqual( {
      subjects: [taxonSubject( 12 )],
      places: [place( 1 )],
    } );
  } );
} );

describe( "exploreSavedSearches", ( ) => {
  it( "saves newest first", ( ) => {
    saved( ).saveSearch( search( ) );
    saved( ).saveSearch( search( { subject: taxonSubject( 13 ) } ) );

    expect( saved( ).searches.map( s => s.subject.taxon.id ) ).toEqual( [13, 12] );
  } );

  it( "keeps the sort it was saved with", ( ) => {
    saved( ).saveSearch( search( { sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST } ) );

    expect( saved( ).searches[0].sortBy ).toEqual( OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST );
    expect( saved( ).searches[0].speciesSortBy ).toEqual( SPECIES_SORT.COUNT_DESC );
  } );

  it( "removes a search by key", ( ) => {
    saved( ).saveSearch( search( ) );
    saved( ).removeSearch( saved( ).searches[0].key );

    expect( saved( ).searches ).toEqual( [] );
  } );

  it( "clears the whole list", ( ) => {
    saved( ).saveSearch( search( ) );
    saved( ).saveSearch( search( { subject: taxonSubject( 13 ) } ) );

    saved( ).clearSavedSearches( );

    expect( saved( ).searches ).toEqual( [] );
  } );

  it( "persists, so saved searches survive a restart", async ( ) => {
    saved( ).saveSearch( search( ) );
    // let the persist middleware flush
    await Promise.resolve( );

    const persisted = JSON.parse( zustandStorage.getItem( "persisted-zustand" ) );
    expect( persisted.state.exploreSavedSearches.searches ).toHaveLength( 1 );
    expect( persisted.state.exploreSavedSearches.searches[0].filters ).toEqual(
      defaultExploreV2Filters,
    );
  } );
} );
