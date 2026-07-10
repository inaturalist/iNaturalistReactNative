import fetchUserProjects from "api/usersTyped";
import Project from "realmModels/Project";
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

  it( "prunes stale joined projects after a successful sync", async () => {
    // Local
    const staleProject = factory( "RemoteProject", { id: 9999 } );
    Project.upsertRemoteProjects( [staleProject], global.realm );
    // API
    const freshProject = factory( "RemoteProject", { id: 1 } );
    fetchUserProjects.mockResolvedValue(
      makeUserProjectsResponse( [freshProject] ),
    );

    await syncJoinedProjects( global.realm, currentUserId );

    expect(
      global.realm.objectForPrimaryKey( "Project", staleProject.id ),
    ).toBeNull();
    expect(
      global.realm.objectForPrimaryKey( "Project", freshProject.id ),
    ).not.toBeNull();
  } );

  it( "does not prune when the fetch returns null", async () => {
    // Local
    const staleProject = factory( "RemoteProject", { id: 9999 } );
    Project.upsertRemoteProjects( [staleProject], global.realm );
    // API
    fetchUserProjects.mockResolvedValue( null );

    await syncJoinedProjects( global.realm, currentUserId );

    expect(
      global.realm.objectForPrimaryKey( "Project", staleProject.id ),
    ).not.toBeNull();
  } );

  it( "no-ops when currentUserId is missing", async () => {
    await syncJoinedProjects( global.realm, undefined );

    expect( fetchUserProjects ).not.toHaveBeenCalled( );
  } );
} );
