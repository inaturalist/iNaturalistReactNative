import fetchUserProjects from "api/usersTyped";
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

describe( "syncJoinedProjects", ( ) => {
  it( "fetches joined projects", async () => {
    const remoteProjects = [
      factory( "RemoteProject", { id: 1 } ),
      factory( "RemoteProject", { id: 2 } ),
    ];

    fetchUserProjects.mockResolvedValue(
      makeUserProjectsResponse( remoteProjects ),
    );

    await syncJoinedProjects( global.realm, currentUserId );

    expect( fetchUserProjects ).toHaveBeenCalled();
  } );

  it( "no-ops when currentUserId is missing", async () => {
    await syncJoinedProjects( global.realm, undefined );

    expect( fetchUserProjects ).not.toHaveBeenCalled( );
  } );
} );
