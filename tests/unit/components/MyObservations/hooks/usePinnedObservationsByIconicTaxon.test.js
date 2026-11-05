import { renderHook } from "@testing-library/react-native";
import usePinnedObservationsByIconicTaxon
  from "components/MyObservations/hooks/usePinnedObservationsByIconicTaxon";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useStore from "stores/useStore";
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
      useQuery: ( { type, query } ) => {
        const realm = global.mockRealms[mockRealmIdentifier];
        const results = realm.objects( type );
        return query
          ? query( results )
          : results;
      },
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const createObservation = observation => {
  const realm = global.mockRealms[mockRealmIdentifier];
  safeRealmWrite( realm, ( ) => {
    realm.create( "Observation", observation, "modified" );
  }, "create test observation for usePinnedObservationsByIconicTaxon" );
};

const unsyncedObsWithIconicTaxon = ( iconicTaxonName, overrides = {} ) => factory(
  "LocalObservation",
  {
    needs_sync: true,
    taxon: iconicTaxonName
      ? factory( "LocalTaxon", { iconic_taxon_name: iconicTaxonName } )
      : null,
    ...overrides,
  },
);

afterEach( ( ) => {
  useStore.setState( { firstUploadUuids: [] } );
} );

beforeEach( ( ) => {
  const realm = global.mockRealms[mockRealmIdentifier];
  safeRealmWrite( realm, ( ) => {
    realm.deleteAll( );
  }, "clear realm before each usePinnedObservationsByIconicTaxon test" );
} );

const unsyncedIn = ( result, category ) => result.current.unsyncedByCategory.get( category );

describe( "usePinnedObservationsByIconicTaxon", ( ) => {
  it( "groups unsynced observations by the iconic taxon of their local taxon", ( ) => {
    const bird = unsyncedObsWithIconicTaxon( "Aves" );
    const plant = unsyncedObsWithIconicTaxon( "Plantae" );
    createObservation( bird );
    createObservation( plant );

    const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.AVES ) ).toEqual( [bird.uuid] );
    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.PLANTAE ) ).toEqual( [plant.uuid] );
  } );

  it( "puts observations with no taxon in OTHER, so a brand new observation is still "
    + "reachable", ( ) => {
    const noTaxon = unsyncedObsWithIconicTaxon( null );
    createObservation( noTaxon );

    const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.OTHER ) ).toEqual( [noTaxon.uuid] );
  } );

  it( "puts observations with an unrecognized iconic taxon in OTHER rather than dropping "
    + "them", ( ) => {
    const unrecognized = unsyncedObsWithIconicTaxon( "Bacteria" );
    createObservation( unrecognized );

    const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.OTHER ) ).toEqual( [unrecognized.uuid] );
  } );

  it( "excludes observations that have already been uploaded", ( ) => {
    createObservation( unsyncedObsWithIconicTaxon( "Aves", { needs_sync: false } ) );
    const stillPinned = unsyncedObsWithIconicTaxon( "Aves" );
    createObservation( stillPinned );

    const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.AVES ) ).toEqual( [stillPinned.uuid] );
  } );

  it( "excludes observations the user has deleted", ( ) => {
    createObservation( unsyncedObsWithIconicTaxon( "Aves", {
      _deleted_at: new Date( ),
      _pending_deletion: true,
    } ) );
    const stillPinned = unsyncedObsWithIconicTaxon( "Aves" );
    createObservation( stillPinned );

    const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.AVES ) ).toEqual( [stillPinned.uuid] );
  } );

  it( "orders a category's observations newest first, matching the flat list's pins", ( ) => {
    const older = unsyncedObsWithIconicTaxon( "Aves", { _created_at: new Date( "2026-01-01" ) } );
    const newer = unsyncedObsWithIconicTaxon( "Aves", { _created_at: new Date( "2026-06-01" ) } );
    createObservation( older );
    createObservation( newer );

    const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

    expect( unsyncedIn( result, ICONIC_TAXA_GROUP.AVES ) ).toEqual( [newer.uuid, older.uuid] );
  } );

  describe( "after a first-time upload", ( ) => {
    // needs_sync clears as soon as the server creates the record
    const uploadedObsWithIconicTaxon = ( iconicTaxonName, overrides = {} ) => {
      const observation = unsyncedObsWithIconicTaxon( iconicTaxonName, {
        needs_sync: false,
        _synced_at: new Date( ),
        ...overrides,
      } );
      useStore.setState( { firstUploadUuids: [observation.uuid] } );
      createObservation( observation );
      return observation;
    };

    const heldIn = ( result, category ) => result.current.uploadsByCategory.get( category );

    it( "keeps it pinned, since the cached pages were fetched before it existed", ( ) => {
      const uploaded = uploadedObsWithIconicTaxon( "Aves" );

      const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

      expect( heldIn( result, ICONIC_TAXA_GROUP.AVES ) ).toEqual( [uploaded.uuid] );
    } );

    it( "holds it apart from the unsynced pins, so the view can place it where the current "
      + "sort puts it", ( ) => {
      uploadedObsWithIconicTaxon( "Aves" );

      const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

      expect( unsyncedIn( result, ICONIC_TAXA_GROUP.AVES ) ).toBeUndefined( );
    } );

    it( "moves it with a local taxon change rather than leaving it in its old section", ( ) => {
      const uploaded = uploadedObsWithIconicTaxon( "Aves" );
      const { result, rerender } = renderHook(
        ( ) => usePinnedObservationsByIconicTaxon( ),
      );

      createObservation( {
        uuid: uploaded.uuid,
        taxon: factory( "LocalTaxon", { iconic_taxon_name: "Plantae" } ),
      } );
      rerender( );

      expect( heldIn( result, ICONIC_TAXA_GROUP.AVES ) ).toBeUndefined( );
      expect( heldIn( result, ICONIC_TAXA_GROUP.PLANTAE ) ).toEqual( [uploaded.uuid] );
    } );

    it( "doesn't keep it pinned once the user deletes it", ( ) => {
      uploadedObsWithIconicTaxon( "Aves", { _deleted_at: new Date( ) } );

      const { result } = renderHook( ( ) => usePinnedObservationsByIconicTaxon( ) );

      expect( heldIn( result, ICONIC_TAXA_GROUP.AVES ) ).toBeUndefined( );
    } );
  } );
} );
