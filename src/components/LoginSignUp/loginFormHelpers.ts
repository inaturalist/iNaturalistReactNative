// Helpers for Apple and Google sign-in. Might be better in AuthenticationService, but
// there's also some UI-related stuff in here, e.g. alerts
import type { AppleError } from "@invertase/react-native-apple-authentication";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  GoogleSignin,
  statusCodes as googleStatusCodes,
} from "@react-native-google-signin/google-signin";
import { t } from "i18next";
import { Alert } from "react-native";
import Config from "react-native-config";
import type Realm from "realm";
import { log } from "sharedHelpers/logger";

import type { AuthenticateUserResult } from "./AuthenticationService";
import {
  authenticateUserByAssertion,
} from "./AuthenticationService";

interface AppleAuthError {
  code: AppleError;
}

const logger = log.extend( "loginFormHelpers" );

function showSignInWithAppleFailed() {
  Alert.alert(
    t( "Sign-in-with-Apple-Failed" ),
    t( "If-you-have-an-existing-account-try-sign-in-reset" ),
  );
}

async function signInWithApple( realm: Realm ): Promise<AuthenticateUserResult> {
  try {
    // Request sign in w/ apple. This should pop up some system UI for signing
    // in
    const appleAuthRequestResponse = await appleAuth.performRequest( {
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    } );

    // Check if auth was successful
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );
    if ( credentialState !== appleAuth.State.AUTHORIZED ) {
      // We only get here if the user does not grant access... I think, so no
      // need to log an error
      logger.info( "Apple auth failed, credentialState: ", credentialState );
      showSignInWithAppleFailed();
      return { success: false };
    }

    // If it was, send the identity token to iNat for verification and iNat
    // auth. Note that we're supporting an irregular assertion that is a JSON
    // object w/ the actual identityToken (which is itself a JSON Web Token),
    // and the user's name, which we only get from Apple the *first* time that
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
        nameSuffix: appleAuthRequestResponse?.fullName?.nameSuffix,
      } ),
    } );
    return await authenticateUserByAssertion( "apple", assertion, realm );
  } catch ( signInError ) {
    if ( ( signInError as AppleAuthError ).code === appleAuth.Error.CANCELED ) {
      // The user canceled sign in, no need to log
      return { success: false };
    }
    logger.error( "Sign in with Apple failed", signInError );
    showSignInWithAppleFailed();
    return { success: false };
  }
}

GoogleSignin.configure( {
  iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
  webClientId: Config.GOOGLE_WEB_CLIENT_ID,
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
} );

function showSignInWithGoogleFailed() {
  Alert.alert(
    t( "Sign-in-with-Google-Failed" ),
    t( "If-you-have-an-existing-account-try-sign-in-reset" ),
  );
}

async function signInWithGoogle( realm: Realm ): Promise<AuthenticateUserResult> {
  try {
    await GoogleSignin.hasPlayServices( );
    const signInResp = await GoogleSignin.signIn();
    if ( signInResp.type === "cancelled" ) return { success: false };
    const tokens = await GoogleSignin.getTokens();
    if ( !tokens?.accessToken ) throw new Error( "Google returned no access token" );
    return await authenticateUserByAssertion( "google", tokens.accessToken, realm );
  } catch ( signInError ) {
    if (
      ( signInError as { code?: string } ).code
      === googleStatusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      Alert.alert(
        t( "Google-Play-Services-Not-Installed" ),
        t( "You-must-install-Google-Play-Services-to-sign-in-with-Google" ),
      );
      return { success: false };
    }
    logger.error( "Sign in with Google failed", signInError );
    showSignInWithGoogleFailed();
    return { success: false };
  }
}

export {
  signInWithApple,
  signInWithGoogle,
};
