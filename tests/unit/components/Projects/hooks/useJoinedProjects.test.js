import { renderHook } from "@testing-library/react-native";
import useJoinedProjects from "components/Projects/hooks/useJoinedProjects";
import inatjs from "inaturalistjs";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import factory, { makeResponse } from "tests/factory";

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( { data: undefined, isFetching: false } ) ),
} ) );

const memberId = 123;

const runQueryFunction = ( ) => {
  const queryFunction = useAuthenticatedQuery.mock.calls[0][1];
  return queryFunction( { api_token: "token" } );
};

describe( "useJoinedProjects", ( ) => {
  it( "fetches every page of joined projects before returning", async ( ) => {
    const firstPage = Array.from( { length: 100 }, ( ) => factory( "RemoteProject" ) );
    const secondPage = [factory( "RemoteProject" )];
    inatjs.users.projects
      .mockResolvedValueOnce( { ...makeResponse( firstPage ), total_results: 101 } )
      .mockResolvedValueOnce( { ...makeResponse( secondPage ), total_results: 101 } );

    renderHook( ( ) => useJoinedProjects( memberId, true ) );
    const projects = await runQueryFunction( );

    expect( projects ).toHaveLength( 101 );
    expect( inatjs.users.projects ).toHaveBeenCalledTimes( 2 );
    expect( inatjs.users.projects ).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining( { id: memberId, page: 2, per_page: 100 } ),
      expect.objectContaining( { api_token: "token" } ),
    );
  } );
} );
