import { appleAuth } from "@invertase/react-native-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { authenticateUserByAssertion } from "components/LoginSignUp/AuthenticationService";
import { signInWithApple, signInWithGoogle } from "components/LoginSignUp/loginFormHelpers";
import i18next from "i18next";
import { Alert } from "react-native";

jest.mock( "@invertase/react-native-apple-authentication", ( ) => ( {
  appleAuth: {
    performRequest: jest.fn( ),
    getCredentialStateForUser: jest.fn( ),
    Operation: { LOGIN: 1 },
    Scope: { EMAIL: 0, FULL_NAME: 1 },
    Error: { CANCELED: "1001" },
    State: { AUTHORIZED: 1 },
  },
} ) );

jest.mock( "@react-native-google-signin/google-signin", ( ) => ( {
  GoogleSignin: {
    configure: jest.fn( ),
    hasPlayServices: jest.fn( ),
    signIn: jest.fn( ),
    getTokens: jest.fn( ),
  },
  statusCodes: { PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE" },
} ) );

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  authenticateUserByAssertion: jest.fn( ),
} ) );

const realm = {};

describe( "loginFormHelpers", ( ) => {
  beforeEach( ( ) => {
    jest.spyOn( Alert, "alert" ).mockImplementation( ( ) => undefined );
    authenticateUserByAssertion.mockResolvedValue( { success: true } );
  } );

  afterEach( ( ) => {
    jest.clearAllMocks( );
  } );

  describe( "signInWithApple", ( ) => {
    it( "fails without an alert when the user cancels", async ( ) => {
      appleAuth.performRequest.mockRejectedValueOnce( { code: appleAuth.Error.CANCELED } );
      expect( await signInWithApple( realm ) ).toEqual( { success: false } );
      expect( Alert.alert ).not.toHaveBeenCalled( );
      expect( authenticateUserByAssertion ).not.toHaveBeenCalled( );
    } );

    it( "alerts when the Apple request fails", async ( ) => {
      appleAuth.performRequest.mockRejectedValueOnce( { code: "1000" } );
      expect( await signInWithApple( realm ) ).toEqual( { success: false } );
      expect( Alert.alert ).toHaveBeenCalledTimes( 1 );
    } );

    it( "alerts when checking the Apple credential fails", async ( ) => {
      appleAuth.performRequest.mockResolvedValueOnce( { user: "apple-user" } );
      appleAuth.getCredentialStateForUser.mockRejectedValueOnce( new Error( "keychain" ) );
      expect( await signInWithApple( realm ) ).toEqual( { success: false } );
      expect( Alert.alert ).toHaveBeenCalledTimes( 1 );
      expect( authenticateUserByAssertion ).not.toHaveBeenCalled( );
    } );
  } );

  describe( "signInWithGoogle", ( ) => {
    beforeEach( ( ) => {
      GoogleSignin.hasPlayServices.mockResolvedValue( true );
      GoogleSignin.signIn.mockResolvedValue( { type: "success", data: {} } );
      GoogleSignin.getTokens.mockResolvedValue( { accessToken: "google-token" } );
    } );

    it( "signs in with the Google access token", async ( ) => {
      expect( await signInWithGoogle( realm ) ).toEqual( { success: true } );
      expect( authenticateUserByAssertion ).toHaveBeenCalledWith( "google", "google-token", realm );
      expect( Alert.alert ).not.toHaveBeenCalled( );
    } );

    it( "fails without an alert when the user cancels", async ( ) => {
      GoogleSignin.signIn.mockResolvedValueOnce( { type: "cancelled", data: null } );
      expect( await signInWithGoogle( realm ) ).toEqual( { success: false } );
      expect( Alert.alert ).not.toHaveBeenCalled( );
      expect( authenticateUserByAssertion ).not.toHaveBeenCalled( );
    } );

    it.each( [
      [
        "checking for Google Play Services fails",
        ( ) => GoogleSignin.hasPlayServices.mockRejectedValueOnce( new Error( "unknown" ) ),
      ],
      [
        "sign-in throws",
        ( ) => GoogleSignin.signIn.mockRejectedValueOnce( new Error( "offline" ) ),
      ],
      [
        "fetching tokens fails",
        ( ) => GoogleSignin.getTokens.mockRejectedValueOnce( new Error( "no tokens" ) ),
      ],
      [
        "Google returns no access token",
        ( ) => GoogleSignin.getTokens.mockResolvedValueOnce( { accessToken: "" } ),
      ],
    ] )( "fails with an alert when %s", async ( _failure, mockFailure ) => {
      mockFailure( );
      expect( await signInWithGoogle( realm ) ).toEqual( { success: false } );
      expect( Alert.alert ).toHaveBeenCalledTimes( 1 );
      expect( Alert.alert ).toHaveBeenCalledWith(
        i18next.t( "Sign-in-with-Google-Failed" ),
        expect.any( String ),
      );
      expect( authenticateUserByAssertion ).not.toHaveBeenCalled( );
    } );
  } );
} );
