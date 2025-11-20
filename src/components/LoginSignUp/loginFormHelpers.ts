// Helpers for LoginForm. Might be better in AuthenticationService, but
// there's also some UI-related stuff in here, e.g. alerts
import type { AppleError } from "@invertase/react-native-apple-authentication";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  GoogleSignin,
  statusCodes as googleStatusCodes
} from "@react-native-google-signin/google-signin";
import { t } from "i18next";
import { Alert } from "react-native";
import Config from "react-native-config";
import type Realm from "realm";
import { log } from "sharedHelpers/logger";

import {
  authenticateUserByAssertion
} from "./AuthenticationService";

interface AppleAuthError {
  code: AppleError;
}

const logger = log.extend( "loginFormHelpers" );

function showSignInWithAppleFailed() {
  Alert.alert(
    t( "Sign-in-with-Apple-Failed" ),
    t( "If-you-have-an-existing-account-try-sign-in-reset" )
  );
}

async function signInWithApple( realm: Realm ) {
  // Request sign in w/ apple. This should pop up some system UI for signing
  // in
  let appleAuthRequestResponse;
  try {
    appleAuthRequestResponse = await appleAuth.performRequest( {
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL]
    } );
  } catch ( appleAuthRequestError ) {
    if ( ( appleAuthRequestError as AppleAuthError ).code === appleAuth.Error.CANCELED ) {
      // The user canceled sign in, no need to log
      return false;
    }
    logger.error( "Apple auth request failed", appleAuthRequestError );
    showSignInWithAppleFailed();
    return false;
  }

  // Check if auth was successful
  const credentialState = await appleAuth.getCredentialStateForUser(
    appleAuthRequestResponse.user
  );

  // If it was, send the identity token to iNat for verification and iNat
  // auth
  if ( credentialState === appleAuth.State.AUTHORIZED ) {
    // Note that we're supporting an irregular assertion that is a JSON object
    // w/ the actual identityToken (which is itself a JSON Web Token), and
    // the user's name, which we only get from Apple the *first* time that
    // grant permission, so the server cannot access it when it verifies the
    // token
    const assertion = JSON.stringify( {
      id_token: appleAuthRequestResponse.identityToken,
      name: t( "apple-full-name", {
        namePrefix: appleAuthRequestResponse?.fullName?.namePrefix,
        givenName: appleAuthRequestResponse?.fullName?.givenName,
        middleName: appleAuthRequestResponse?.fullName?.middleName,
        nickname: appleAuthRequestResponse?.fullName?.nickname,
        familyName: appleAuthRequestResponse?.fullName?.familyName,
        nameSuffix: appleAuthRequestResponse?.fullName?.nameSuffix
      } )
    } );
    try {
      await authenticateUserByAssertion( "apple", assertion, realm );
    } catch ( authenticateUserByAssertionError ) {
      logger.error( "Assertion with Apple token failed", authenticateUserByAssertionError );
      showSignInWithAppleFailed();
      return false;
    }
    return true;
  }
  // We only get here if the user does not grant access... I think, so no need
  // to log an error
  logger.info( "Apple auth failed, credentialState: ", credentialState );
  showSignInWithAppleFailed();
  return false;
}

GoogleSignin.configure( {
  iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
  webClientId: Config.GOOGLE_WEB_CLIENT_ID,
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
} );

async function confirmGooglePlayServices() {
  try {
    await GoogleSignin.hasPlayServices( );
    return true;
  } catch ( hasPlayServicesError ) {
    if (
      ( hasPlayServicesError as { code: string } ).code
      === googleStatusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      Alert.alert(
        t( "Google-Play-Services-Not-Installed" ),
        t( "You-must-install-Google-Play-Services-to-sign-in-with-Google" )
      );
      return false;
    }
    throw hasPlayServicesError;
  }
}

function showSignInWithGoogleFailed() {
  Alert.alert(
    t( "Sign-in-with-Google-Failed" ),
    t( "If-you-have-an-existing-account-try-sign-in-reset" )
  );
}

async function signInWithGoogle( realm: Realm ) {
  const hasPlayServices = await confirmGooglePlayServices( );
  if ( !hasPlayServices ) return false;
  let signInResp;
  try {
    signInResp = await GoogleSignin.signIn();
  } catch ( signInError ) {
    logger.error( "Failed to sign in with Google", signInError );
    return false;
  }
  if ( signInResp.type === "cancelled" ) return false;
  let tokens;
  try {
    tokens = await GoogleSignin.getTokens();
  } catch ( getTokensError ) {
    logger.error( "Failed to get tokens from Google", getTokensError );
    return false;
  }
  if ( !tokens?.accessToken ) return false;
  try {
    await authenticateUserByAssertion( "google", tokens.accessToken, realm );
  } catch ( authenticateUserByAssertionError ) {
    logger.error( "Assertion with Google token failed", authenticateUserByAssertionError );
    showSignInWithGoogleFailed();
    return false;
  }
  return true;
}

export {
  signInWithApple,
  signInWithGoogle
};
