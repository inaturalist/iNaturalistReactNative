import { appleAuth, AppleButton } from "@invertase/react-native-apple-authentication";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes as googleStatusCodes
} from "@react-native-google-signin/google-signin";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import Debug from "components/Developer/Debug.tsx";
import {
  Body1, Body2, Button, INatIcon, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts.ts";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";
import Config from "react-native-config";
import Realm from "realm";
import { log } from "sharedHelpers/logger";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import colors from "styles/tailwindColors";

import {
  authenticateUser,
  authenticateUserByAssertion
} from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

interface Props {
  hideFooter?: boolean;
}

interface LoginFormParams {
  emailConfirmed?: boolean;
  prevScreen?: string;
  projectId?: number;
}

type ParamList = {
  LoginFormParams: LoginFormParams
}

const APPLE_BUTTON_STYLE = {
  maxWidth: 500,
  height: 45, // You must specify a height
  marginTop: 10
};

const logger = log.extend( "LoginForm" );

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
  const signInResp = await GoogleSignin.signIn();
  if ( signInResp.type === "cancelled" ) return false;
  const tokens = await GoogleSignin.getTokens();
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

const LoginForm = ( {
  hideFooter
}: Props ) => {
  const { params } = useRoute<RouteProp<ParamList, "LoginFormParams">>( );
  const emailConfirmed = params?.emailConfirmed;
  const realm = useRealm( );
  const emailRef = useRef<TextInput>( null );
  const passwordRef = useRef<TextInput>( null );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState<string | null>( null );
  const [loading, setLoading] = useState( false );
  const [isPasswordVisible, setIsPasswordVisible] = useState( false );
  const { keyboardShown } = useKeyboardInfo( );

  const blurFields = () => {
    if ( emailRef.current ) {
      emailRef.current.blur();
    }
    if ( passwordRef.current ) {
      passwordRef.current.blur();
    }
  };

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", blurFields );

    return unsubscribeBlur;
  }, [navigation] );

  useEffect( () => {
    const unsubscrubeTransition = navigation.addListener( "transitionEnd", blurFields );

    return unsubscrubeTransition;
  }, [navigation] );

  const logIn = React.useCallback( async ( logInCallback: () => Promise<boolean> ) => {
    setLoading( true );
    const success = await logInCallback( );

    if ( !success ) {
      setError( t( "Failed-to-log-in" ) );
      setLoading( false );
      return;
    }
    setLoading( false );

    if ( params?.prevScreen && params?.projectId ) {
      navigation.navigate( "TabNavigator", {
        screen: "TabStackNavigator",
        params: {
          screen: "ProjectDetails",
          params: {
            id: params?.projectId
          }
        }
      } );
    } else {
      navigation.getParent( )?.goBack( );
    }
  }, [
    navigation,
    params
  ] );

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View className="px-4 mt-[9px] justify-end">
        { emailConfirmed && (
          <View className="flex-row mb-5 items-center justify-center mx-2">
            <View className="bg-white rounded-full">
              <INatIcon
                name="checkmark-circle"
                color={String( colors?.inatGreen )}
                size={19}
              />
            </View>
            <List2 className="ml-3 text-white font-medium">
              {t( "Your-email-is-confirmed" )}
            </List2>
          </View>
        ) }
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
          autoComplete="email"
          headerText={t( "USERNAME-OR-EMAIL" )}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={( text: string ) => setEmail( text )}
          testID="Login.email"
          // https://github.com/facebook/react-native/issues/39411#issuecomment-1817575790
          // textContentType prevents visual flickering, which is a temporary issue
          // in iOS 17
          textContentType="emailAddress"
        />
        <LoginSignUpInputField
          ref={passwordRef}
          accessibilityLabel={t( "PASSWORD" )}
          autoComplete="current-password"
          headerText={t( "PASSWORD" )}
          inputMode="text"
          onChangeText={( text: string ) => setPassword( text )}
          secureTextEntry={!isPasswordVisible}
          testID="Login.password"
          textContentType="password"
        />
        <View className="flex-row justify-between">
          <Body2
            accessibilityRole="button"
            className="underline p-4 color-white"
            onPress={() => setIsPasswordVisible( prevState => !prevState )}
          >
            {isPasswordVisible
              ? t( "Hide" )
              : t( "Reveal" )}
          </Body2>
          <Body2
            accessibilityRole="button"
            className="underline p-4 color-white"
            onPress={( ) => navigation.navigate( "ForgotPassword" )}
          >
            {t( "Forgot-Password" )}
          </Body2>
        </View>
        {error && <Error error={error} />}
        <Button
          className={classnames( "mt-[30px]", {
            "mt-5": error
          } )}
          disabled={!email || !password}
          forceDark
          level="focus"
          loading={loading}
          onPress={() => logIn( async () => authenticateUser(
            email.trim( ),
            password,
            realm
          ) )}
          testID="Login.loginButton"
          text={t( "LOG-IN" )}
        />
        {/*
          Note: Sign in with Apple is doable in Android if we want to:
          https://github.com/invertase/react-native-apple-authentication?tab=readme-ov-file#android
        */}
        { Platform.OS === "ios" && (
          <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={APPLE_BUTTON_STYLE}
            onPress={() => logIn( async ( ) => signInWithApple( realm ) )}
          />
        ) }
        <Debug>
          <View className="w-full items-center mt-3">
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={() => logIn( async ( ) => signInWithGoogle( realm ) )}
              disabled={loading}
            />
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={() => logIn( async ( ) => signInWithGoogle( realm ) )}
              disabled={loading}
            />
          </View>
        </Debug>
        {!hideFooter && (
          <Body1
            className={classnames(
              "color-white self-center mt-[31px] underline",
              // When the keyboard is up this pushes the form up enough to cut
              // off the username label on some devices
              !keyboardShown && "mb-[35px]"
            )}
            onPress={( ) => navigation.navigate( "SignUp" )}
          >
            {t( "Dont-have-an-account" )}
          </Body1>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginForm;
