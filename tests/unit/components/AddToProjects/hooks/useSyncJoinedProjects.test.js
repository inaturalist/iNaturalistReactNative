import { useNetInfo } from "@react-native-community/netinfo";
import { renderHook } from "@testing-library/react-native";
import useSyncJoinedProjects from "components/AddToProjects/hooks/useSyncJoinedProjects";
import syncJoinedProjects from "sharedHelpers/syncJoinedProjects";
import { useCurrentUser } from "sharedHooks";

const mockRealm = {};
jest.mock( "providers/contexts", () => ( {
  RealmContext: {
    useRealm: () => mockRealm,
  },
} ) );

jest.mock( "sharedHelpers/syncJoinedProjects", () => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

jest.mock( "sharedHooks", () => ( {
  __esModule: true,
  useCurrentUser: jest.fn( ),
} ) );

const currentUserId = 42;

describe( "useSyncJoinedProjects", () => {
  beforeEach( () => {
    jest.clearAllMocks();
    useCurrentUser.mockReturnValue( { id: currentUserId } );
    useNetInfo.mockReturnValue( { isConnected: true } );
  } );

  it( "syncs joined projects when connected and signed in", () => {
    renderHook( () => useSyncJoinedProjects() );

    expect( syncJoinedProjects ).toHaveBeenCalledWith( mockRealm, currentUserId );
  } );

  it( "does not sync when offline", () => {
    useNetInfo.mockReturnValue( { isConnected: false } );

    renderHook( () => useSyncJoinedProjects() );

    expect( syncJoinedProjects ).not.toHaveBeenCalled();
  } );

  it( "does not sync while connectivity is still undetermined", () => {
    useNetInfo.mockReturnValue( { isConnected: null } );

    renderHook( () => useSyncJoinedProjects() );

    expect( syncJoinedProjects ).not.toHaveBeenCalled();
  } );

  it( "does not sync when there is no current user", () => {
    useCurrentUser.mockReturnValue( null );

    renderHook( () => useSyncJoinedProjects() );

    expect( syncJoinedProjects ).not.toHaveBeenCalled();
  } );

  it( "syncs once connectivity is restored", () => {
    useNetInfo.mockReturnValue( { isConnected: false } );

    const { rerender } = renderHook( () => useSyncJoinedProjects() );
    expect( syncJoinedProjects ).not.toHaveBeenCalled();

    useNetInfo.mockReturnValue( { isConnected: true } );
    rerender();

    expect( syncJoinedProjects ).toHaveBeenCalledTimes( 1 );
    expect( syncJoinedProjects ).toHaveBeenCalledWith( mockRealm, currentUserId );
  } );

  it( "does not sync again when connectivity is lost and regained", () => {
    const { rerender } = renderHook( () => useSyncJoinedProjects() );
    expect( syncJoinedProjects ).toHaveBeenCalledTimes( 1 );

    useNetInfo.mockReturnValue( { isConnected: false } );
    rerender();

    useNetInfo.mockReturnValue( { isConnected: true } );
    rerender();

    expect( syncJoinedProjects ).toHaveBeenCalledTimes( 1 );
  } );
} );
