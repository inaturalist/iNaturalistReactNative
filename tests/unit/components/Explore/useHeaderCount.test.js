import { renderHook } from "@testing-library/react-native";
import useHeaderCount from "components/Explore/hooks/useHeaderCount";

const GLOBAL_OBSERVATION_COUNT = 4567890;

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    data: {
      total_results: GLOBAL_OBSERVATION_COUNT
    }
  } ) )
} ) );

describe( "useHeaderCount", ( ) => {
  it( "should show global count for worldwide search", ( ) => {
    const { result } = renderHook( ( ) => useHeaderCount( {} ) );
    expect( result.current.count.observations ).toBe( GLOBAL_OBSERVATION_COUNT );
  } );
} );
