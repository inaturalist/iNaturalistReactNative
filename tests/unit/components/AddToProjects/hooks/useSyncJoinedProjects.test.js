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
  } );
  it( "does not sync when there is no current user", () => {
    useCurrentUser.mockReturnValue( null );

    renderHook( () => useSyncJoinedProjects() );

    expect( syncJoinedProjects ).not.toHaveBeenCalled();
  } );
} );
