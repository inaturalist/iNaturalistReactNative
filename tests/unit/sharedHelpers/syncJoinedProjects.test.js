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

const makeUserProjectsResponse = (
  results,
  { page = 1, totalResults = results.length } = {},
) => ( {
  results,
  page,
  per_page: 100,
  total_results: totalResults,
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

  it( "prunes all local joined projects when the server returns an empty list", async () => {
    // Local
    const staleProject = factory( "RemoteProject", { id: 9999 } );
    Project.upsertRemoteProjects( [staleProject], global.realm );
    // API
    fetchUserProjects.mockResolvedValue( makeUserProjectsResponse( [] ) );

    await syncJoinedProjects( global.realm, currentUserId );

    expect( global.realm.objects( "Project" ) ).toHaveLength( 0 );
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

  it( "fetches all pages and prunes after the last page", async () => {
    // Local
    const staleProject = factory( "RemoteProject", { id: 9999 } );
    Project.upsertRemoteProjects( [staleProject], global.realm );
    // API: 150 total results across two pages
    const pageOneProjects = [
      factory( "RemoteProject", { id: 1 } ),
      factory( "RemoteProject", { id: 2 } ),
    ];
    const pageTwoProjects = [factory( "RemoteProject", { id: 3 } )];
    fetchUserProjects
      .mockResolvedValueOnce(
        makeUserProjectsResponse( pageOneProjects, { totalResults: 150 } ),
      )
      .mockResolvedValueOnce(
        makeUserProjectsResponse( pageTwoProjects, { page: 2, totalResults: 150 } ),
      );

    await syncJoinedProjects( global.realm, currentUserId );

    expect( fetchUserProjects ).toHaveBeenCalledTimes( 2 );
    expect( fetchUserProjects ).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining( { page: 1, per_page: 100 } ),
      expect.anything( ),
    );
    expect( fetchUserProjects ).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining( { page: 2, per_page: 100 } ),
      expect.anything( ),
    );
    expect( global.realm.objects( "Project" ) ).toHaveLength( 3 );
    expect(
      global.realm.objectForPrimaryKey( "Project", staleProject.id ),
    ).toBeNull();
  } );

  it( "does not prune or throw when a later page fails", async () => {
    // Local
    const staleProject = factory( "RemoteProject", { id: 9999 } );
    Project.upsertRemoteProjects( [staleProject], global.realm );
    // API: page 1 succeeds, page 2 fails
    const pageOneProject = factory( "RemoteProject", { id: 1 } );
    fetchUserProjects
      .mockResolvedValueOnce(
        makeUserProjectsResponse( [pageOneProject], { totalResults: 150 } ),
      )
      .mockRejectedValueOnce( new Error( "network request failed" ) );

    await expect(
      syncJoinedProjects( global.realm, currentUserId ),
    ).resolves.toBeUndefined( );

    expect( fetchUserProjects ).toHaveBeenCalledTimes( 2 );
    // Page 1 was upserted, but the stale local project was not pruned
    expect(
      global.realm.objectForPrimaryKey( "Project", pageOneProject.id ),
    ).not.toBeNull();
    expect(
      global.realm.objectForPrimaryKey( "Project", staleProject.id ),
    ).not.toBeNull();
  } );
  it( "does not prune or throw when the first fetch fails", async () => {
    // Local
    const staleProject = factory( "RemoteProject", { id: 9999 } );
    Project.upsertRemoteProjects( [staleProject], global.realm );
    // API
    fetchUserProjects.mockRejectedValue( new Error( "network request failed" ) );

    await expect(
      syncJoinedProjects( global.realm, currentUserId ),
    ).resolves.toBeUndefined( );

    expect(
      global.realm.objectForPrimaryKey( "Project", staleProject.id ),
    ).not.toBeNull();
  } );
} );
