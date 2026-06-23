import { useNetInfo } from "@react-native-community/netinfo";
import { act, renderHook } from "@testing-library/react-native";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import { Alert } from "react-native";
import Config from "react-native-config";
import { EventRegister } from "react-native-event-listeners";
import useNavigateToAccountSettings from "sharedHooks/useNavigateToAccountSettings";

const mockNavigate = jest.fn();
jest.mock( "@react-navigation/native", () => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useNavigation: () => ( { navigate: mockNavigate } ),
  // Run the focus callback synchronously so we don't need a NavigationContainer
  useFocusEffect: jest.fn(),
} ) );

const mockSetIsDefaultMode = jest.fn();
jest.mock( "sharedHooks/useLayoutPrefs", () => ( {
  __esModule: true,
  default: () => ( { setIsDefaultMode: mockSetIsDefaultMode } ),
} ) );

const mockRealm = {};
jest.mock( "providers/contexts", () => ( {
  RealmContext: {
    useRealm: () => mockRealm,
  },
} ) );

const mockQueryClient = {};
jest.mock( "@tanstack/react-query", () => ( {
  ...jest.requireActual( "@tanstack/react-query" ),
  useQueryClient: () => mockQueryClient,
} ) );

jest.mock( "components/LoginSignUp/AuthenticationService", () => ( {
  __esModule: true,
  signOut: jest.fn( () => Promise.resolve() ),
} ) );

const ACCOUNT_DELETED_URL = `${Config.OAUTH_API_URL}/?account_deleted=true`;

describe( "useNavigateToAccountSettings", () => {
  beforeEach( () => {
    jest.clearAllMocks();
    useNetInfo.mockReturnValue( { isConnected: true } );
  } );

  it( "alerts and does not navigate when there is no internet", () => {
    const alertSpy = jest.spyOn( Alert, "alert" ).mockImplementation( () => {} );
    useNetInfo.mockReturnValue( { isConnected: false } );

    const { result } = renderHook( () => useNavigateToAccountSettings() );
    act( () => result.current() );

    expect( alertSpy ).toHaveBeenCalled();
    expect( mockNavigate ).not.toHaveBeenCalled();
  } );

  it( "navigates to the account settings web view when connected", () => {
    const { result } = renderHook( () => useNavigateToAccountSettings() );
    act( () => result.current() );

    expect( mockNavigate ).toHaveBeenCalledWith(
      "FullPageWebView",
      expect.objectContaining( {
        loggedIn: true,
        clickablePathnames: ["/users/delete"],
      } ),
    );
  } );

  it( "signs the user out when the web view reports the account was deleted", async () => {
    const alertSpy = jest.spyOn( Alert, "alert" ).mockImplementation( () => {} );

    const { result } = renderHook( () => useNavigateToAccountSettings() );
    act( () => result.current() );

    const { shouldLoadUrl } = mockNavigate.mock.calls[0][1];
    const shouldLoad = shouldLoadUrl( ACCOUNT_DELETED_URL );

    // Block the web view from loading the deletion-confirmation URL
    expect( shouldLoad ).toBe( false );
    // Allow the async signOut flow inside shouldLoadUrl to resolve
    await Promise.resolve();

    expect( signOut ).toHaveBeenCalledWith(
      expect.objectContaining( { realm: mockRealm, clearRealm: true } ),
    );
    expect( mockSetIsDefaultMode ).toHaveBeenCalledWith( true );
    expect( mockNavigate ).toHaveBeenCalledWith( "ObsList" );
    expect( alertSpy ).toHaveBeenCalled();
  } );
  it( "calls onFinish when the web settings finished event fires", () => {
    const onFinish = jest.fn();
    let registeredCallback;
    jest.spyOn( EventRegister, "addEventListener" )
      .mockImplementation( ( eventName, cb ) => {
        registeredCallback = cb;
        return "listener-id";
      } );

    renderHook( () => useNavigateToAccountSettings( { onFinish } ) );

    expect( registeredCallback ).toBeDefined();
    registeredCallback();
    expect( onFinish ).toHaveBeenCalled();
  } );
} );
