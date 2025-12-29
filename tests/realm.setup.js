import mockOs from "os";
import mockPath from "path";
import Realm from "realm";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";

// Mock the realm config so it uses an in-memory database. This means data is
// only persisted until realm.close() gets called, so if the code under test
// needs data to persist in Realm across opening/closing events, we will need
// to take a different approach, e.g. writing to Realm to disk and erasing
// those files after each test run
jest.mock( "realmModels/index", ( ) => {
  const originalModule = jest.requireActual( "realmModels/index" );

  // Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    default: {
      schema: originalModule.default.schema,
      schemaVersion: originalModule.default.schemaVersion,
      inMemory: true,
      path: mockPath.join( mockOs.tmpdir( ), "testArtifacts.realm" ),
    },
  };
} );

// Mock the contexts so the useRealm hook will provide a single, custom copy
// of the Realm connection
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.realm,
    },
  };
} );

// Open a realm connection and stuff it in global. If there's a better way to
// do this without having jest.mock complain about referring to variables out
// of scope, please propose it.
beforeAll( async ( ) => {
  global.realm = await Realm.open( realmConfig );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.realm?.close( );
  Realm.shutdown();
} );
