import os from "os";
import path from "path";
import Realm from "realm";
import realmConfig from "realmModels/index";

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
