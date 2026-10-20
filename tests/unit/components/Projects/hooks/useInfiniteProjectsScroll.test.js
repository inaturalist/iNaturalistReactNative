import { renderHook } from "@testing-library/react-native";
import useInfiniteProjectsScroll from "components/Projects/hooks/useInfiniteProjectsScroll";
import factory from "tests/factory";

const mockProjects = [
  factory( "RemoteProject", { title: "Charlie" } ),
  factory( "RemoteProject", { title: "Alpha" } ),
  factory( "RemoteProject", { title: "Bravo" } ),
];

jest.mock( "sharedHooks/useAuthenticatedInfiniteQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    data: {
      pages: [
        { results: mockProjects.slice( 0, 2 ) },
        { results: mockProjects.slice( 2 ) },
      ],
    },
  } ) ),
} ) );

const titles = projects => projects.map( project => project.title );

describe( "useInfiniteProjectsScroll", ( ) => {
  it( "alphabetizes projects when no server order is requested", ( ) => {
    const { result } = renderHook( ( ) => useInfiniteProjectsScroll( {
      params: { featured: true },
      enabled: true,
    } ) );
    expect( titles( result.current.projects ) ).toEqual( ["Alpha", "Bravo", "Charlie"] );
  } );

  it( "keeps the server order when order_by is requested", ( ) => {
    const { result } = renderHook( ( ) => useInfiniteProjectsScroll( {
      params: { order_by: "distance" },
      enabled: true,
    } ) );
    expect( titles( result.current.projects ) ).toEqual( ["Charlie", "Alpha", "Bravo"] );
  } );
} );
