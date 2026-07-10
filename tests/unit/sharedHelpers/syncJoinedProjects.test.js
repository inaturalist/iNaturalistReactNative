import fetchUserProjects from "api/usersTyped";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import syncJoinedProjects from "sharedHelpers/syncJoinedProjects";
import factory from "tests/factory";

jest.mock( "api/usersTyped", () => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

const currentUserId = 42;

const makeUserProjectsResponse = results => ( {
  results,
  page: 1,
  per_page: 200,
  total_results: results.length,
} );

beforeEach( ( ) => {
  jest.clearAllMocks( );
  safeRealmWrite( global.realm, ( ) => {
    global.realm.delete( global.realm.objects( "Project" ) );
  }, "resetting projects in syncJoinedProjects test" );
} );

describe( "syncJoinedProjects", ( ) => {
  it( "fetches joined projects and upserts them into Realm", async () => {
    const remoteProjects = [
      factory( "RemoteProject", { id: 1 } ),
      factory( "RemoteProject", { id: 2 } ),
    ];

    fetchUserProjects.mockResolvedValue(
      makeUserProjectsResponse( remoteProjects ),
    );

    await syncJoinedProjects( global.realm, currentUserId );

    expect( fetchUserProjects ).toHaveBeenCalled();
    expect( global.realm.objects( "Project" ) ).toHaveLength( 2 );
  } );

  it( "no-ops when currentUserId is missing", async () => {
    await syncJoinedProjects( global.realm, undefined );

    expect( fetchUserProjects ).not.toHaveBeenCalled( );
  } );
} );
