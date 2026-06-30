import os from "os";
import path from "path";
import Realm from "realm";
import realmConfig from "realmModels/index";

// Named export usable inside jest.mock factories via jest.requireActual.
// Mock factories run at module-load time (before setupUniqueRealm is called),
// so the hooks must be built lazily from __filename rather than from a
// variable captured at factory registration time.
export function makeRealmHooks( realmIdentifier ) {
  return {
    useRealm: ( ) => global.mockRealms[realmIdentifier],
    useQuery: typeOrConfig => {
      const realm = global.mockRealms[realmIdentifier];
      if ( !realm || realm.isClosed ) return [];
      if ( typeOrConfig && typeof typeOrConfig === "object" && typeOrConfig.type ) {
        const { type, query: configQuery } = typeOrConfig;
        const results = realm.objects( type );
        return configQuery
          ? configQuery( results )
          : results;
      }
      return [];
    },
    useObject: ( type, primaryKey ) => (
      global.mockRealms[realmIdentifier]?.objectForPrimaryKey( type, primaryKey ) ?? null
    ),
  };
}

export default function setupUniqueRealm( realmIdentifier ) {
  const mockRealmConfig = {
    schema: realmConfig.schema,
    schemaVersion: realmConfig.schemaVersion,
    // No need to actually write to disk
    inMemory: true,
    // For an in memory db path is basically a unique identifier, *but* Realm
    // may still write some metadata to disk, so this needs to be a real, but
    // temporary, path. In theory this should prevent this test from
    // interacting with other tests
    path: path.join( os.tmpdir( ), `${realmIdentifier}.realm` ),
  };

  // Mock config so that all code that runs during this test talks to the same
  // database
  const mockRealmModelsIndex = {
    __esModule: true,
    default: mockRealmConfig,
  };

  const uniqueRealmBeforeAll = async ( ) => {
    global.mockRealms = global.mockRealms || {};
    global.mockRealms[realmIdentifier] = await Realm.open( mockRealmConfig );
  };

  // Ensure the realm connection gets closed
  const uniqueRealmAfterAll = ( ) => {
    global.mockRealms[realmIdentifier]?.close( );
    jest.clearAllMocks( );
  };

  return {
    mockRealmConfig,
    mockRealmModelsIndex,
    uniqueRealmBeforeAll,
    uniqueRealmAfterAll,
  };
}
