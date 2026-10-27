import { renderHook, waitFor } from "@testing-library/react-native";
import Realm from "realm";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useListItemObservation from "sharedHooks/useListItemObservation";
import factory from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const realm = ( ) => global.mockRealms[mockRealmIdentifier];

const write = ( fn, description ) => safeRealmWrite( realm( ), fn, description );

let uuid;

const storedObservation = ( ) => realm( ).objectForPrimaryKey( "Observation", uuid );

// Live listeners on Realm objects and on collections (Results and List), counted as additions minus
// removals
const spyOnListeners = ( ) => {
  const spies = [
    jest.spyOn( Realm.Object.prototype, "addListener" ),
    jest.spyOn( Realm.Object.prototype, "removeListener" ),
    jest.spyOn( Realm.Collection.prototype, "addListener" ),
    jest.spyOn( Realm.Collection.prototype, "removeListener" ),
  ];
  const [objectAdds, objectRemoves, collectionAdds, collectionRemoves] = spies;
  return {
    live: ( ) => objectAdds.mock.calls.length - objectRemoves.mock.calls.length,
    liveOnCollections: (
      ( ) => collectionAdds.mock.calls.length - collectionRemoves.mock.calls.length
    ),
  };
};

beforeEach( ( ) => {
  const observation = factory( "LocalObservation", {
    needs_sync: true,
    observationPhotos: [factory( "LocalObservationPhoto" )],
    observationSounds: [factory( "LocalObservationSound" )],
  } );
  ( { uuid } = observation );
  write( ( ) => {
    realm( ).deleteAll( );
    realm( ).create( "Observation", observation );
  }, "seed useListItemObservation test" );
} );

afterEach( ( ) => {
  jest.restoreAllMocks( );
} );

describe( "useListItemObservation", ( ) => {
  it( "returns the observation", ( ) => {
    const { result } = renderHook( ( ) => useListItemObservation( uuid ) );
    expect( result.current?.uuid ).toEqual( uuid );
  } );

  it( "returns null for a null uuid, without subscribing", ( ) => {
    const listeners = spyOnListeners( );
    const { result } = renderHook( ( ) => useListItemObservation( null ) );
    expect( result.current ).toBeNull( );
    expect( listeners.live( ) ).toBe( 0 );
  } );

  it( "re-renders with a new object when the observation is updated", async ( ) => {
    const { result } = renderHook( ( ) => useListItemObservation( uuid ) );
    const before = result.current;
    expect( before?.needs_sync ).toBe( true );

    write( ( ) => {
      storedObservation( ).needs_sync = false;
    }, "mark observation synced" );

    // A new object, so anything memoized on the observation downstream recomputes
    await waitFor( ( ) => expect( result.current ).not.toBe( before ) );
    expect( result.current?.needs_sync ).toBe( false );
  } );

  it( "re-renders when a photo is added", async ( ) => {
    const { result } = renderHook( ( ) => useListItemObservation( uuid ) );
    const before = result.current;

    write( ( ) => {
      storedObservation( ).observationPhotos.push( factory( "LocalObservationPhoto" ) );
    }, "add observation photo" );

    await waitFor( ( ) => expect( result.current ).not.toBe( before ) );
    expect( result.current?.observationPhotos ).toHaveLength( 2 );
  } );

  // The listener isn't notified when only a linked object changes, such as a photo's sync state.
  // That's fine for the upload indicator: the uploader marks photos and sounds synced first, and
  // marks the observation itself last (observationUploader step 5), and needsSync( ) stays true
  // until that last write.
  it( "re-renders with needsSync( ) cleared once an upload finishes", async ( ) => {
    const { result } = renderHook( ( ) => useListItemObservation( uuid ) );
    const before = result.current;
    expect( before?.needsSync( ) ).toBe( true );

    write( ( ) => {
      const observation = storedObservation( );
      observation.observationPhotos[0]._synced_at = new Date( );
      observation.observationSounds[0]._synced_at = new Date( );
    }, "mark evidence uploaded" );
    write( ( ) => {
      const observation = storedObservation( );
      observation._synced_at = new Date( );
      observation.needs_sync = false;
    }, "mark observation uploaded" );

    // A new object, not just the live one reading fresh data, so the tile re-renders
    await waitFor( ( ) => expect( result.current ).not.toBe( before ) );
    expect( result.current?.needsSync( ) ).toBe( false );
  } );

  it( "returns null, not an invalidated object, once the observation is deleted", async ( ) => {
    const { result, unmount } = renderHook( ( ) => useListItemObservation( uuid ) );
    expect( result.current ).not.toBeNull( );

    write( ( ) => {
      realm( ).delete( storedObservation( ) );
    }, "delete observation" );

    await waitFor( ( ) => expect( result.current ).toBeNull( ) );
    // Unmounting removes the listener from a deleted object, which mustn't throw
    unmount( );
  } );

  it( "registers one object listener, and none on lists, and removes it on unmount", ( ) => {
    const listeners = spyOnListeners( );
    const { unmount } = renderHook( ( ) => useListItemObservation( uuid ) );
    expect( listeners.live( ) ).toBe( 1 );
    expect( listeners.liveOnCollections( ) ).toBe( 0 );
    unmount( );
    expect( listeners.live( ) ).toBe( 0 );
  } );

  it( "moves its listener when the uuid changes, as when a cell is recycled", ( ) => {
    const other = factory( "LocalObservation" );
    write( ( ) => {
      realm( ).create( "Observation", other );
    }, "seed second observation" );
    const listeners = spyOnListeners( );
    const { result, rerender, unmount } = renderHook(
      ( { id } ) => useListItemObservation( id ),
      { initialProps: { id: uuid } },
    );
    rerender( { id: other.uuid } );
    expect( result.current?.uuid ).toEqual( other.uuid );
    expect( listeners.live( ) ).toBe( 1 );
    unmount( );
    expect( listeners.live( ) ).toBe( 0 );
  } );
} );
