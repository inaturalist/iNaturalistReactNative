import fetchUserProjects from "api/usersTyped";
import syncJoinedProjects from "sharedHelpers/syncJoinedProjects";

jest.mock( "api/usersTyped", () => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

describe( "syncJoinedProjects", ( ) => {
  it( "no-ops when currentUserId is missing", async () => {
    await syncJoinedProjects( global.realm, undefined );

    expect( fetchUserProjects ).not.toHaveBeenCalled( );
  } );
} );
