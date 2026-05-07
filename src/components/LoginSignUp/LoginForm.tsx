import { useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import type { AuthenticateUserResult } from "components/LoginSignUp/AuthenticationService";
import { authenticateUser, signOut } from "components/LoginSignUp/AuthenticationService";
import {
  Body1, Body2, Button, CloseButton, Heading4, INatIcon, INatIconButton, List2,
  WarningSheet,
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import { t } from "i18next";
import type { LoginStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback, useEffect, useRef, useState,
} from "react";
import { Trans } from "react-i18next";
import type { ScrollView, TextInput } from "react-native";
import {
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useCurrentUser, useLayoutPrefs } from "sharedHooks";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import colors from "styles/tailwindColors";

import Error from "./Error";
import { signInWithApple, signInWithGoogle } from "./loginFormHelpers";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

interface Props {
  scrollViewRef?: React.Ref<ScrollView>;
}

/**
 * If a user loggs in and their account has at least this many
 * uploaded observations, auto-switch to advanced mode
 */
export const AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD = 100;

const LoginForm = ( {
  scrollViewRef,
}: Props ) => {
  const navigation = useNavigation<LoginStackScreenProps<"Login">["navigation"]>( );
  const { params } = useRoute<LoginStackScreenProps<"Login">["route"]>();
  const emailConfirmed = params?.emailConfirmed;
  // For debug reasons, we can send the user here to log in again, but we must ensure
  // that only the currently logged in user can log in again. And no other user account
  // can log in with the debug flow.
  const currentUser = useCurrentUser( );
  const loginAgain = !!currentUser && !!currentUser?.login;
  const realm = useRealm( );
  const { isDefaultMode, setIsDefaultMode, setLoggedInWhileInDefaultMode }
    = useLayoutPrefs();
  const firstInputFieldRef = useRef( null );
  const emailRef = useRef<TextInput>( null );
  const passwordRef = useRef<TextInput>( null );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState<string | null>( null );
  const [loading, setLoading] = useState( false );
  const [isPasswordVisible, setIsPasswordVisible] = useState( false );
  const { keyboardShown } = useKeyboardInfo( );
  const [showModal, setShowModal] = useState( false );

  const onSignOut = async () => {
    await signOut( { realm, clearRealm: true } );
  };

  const renderSignOutButton = useCallback(
    () => (
      <CloseButton
        handleClose={() => setShowModal( true )}
        buttonClassName="mr-[-5px]"
      />
    ),
    [],
  );

  useEffect( () => {
    if ( loginAgain ) {
      navigation.setOptions( {
        headerRight: renderSignOutButton,
      } );
    }
  }, [loginAgain, navigation, renderSignOutButton] );

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

  const logIn = useCallback( async ( logInCallback: () => Promise<AuthenticateUserResult> ) => {
    setLoading( true );
    const result = await logInCallback( );

    if ( !result.success ) {
      setError( t( "Failed-to-log-in" ) );
      setLoading( false );
      return;
    }

    setLoading( false );

    if (
      result.observationsCount
      && result.observationsCount >= AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD
    ) {
      // If a user that just logged in already has more than the threshold number of observations,
      // we assume they are an advanced user and switch them to advanced mode.
      setIsDefaultMode( false );
    } else {
      // Set a state to zustand that we just logged in while in default mode
      setLoggedInWhileInDefaultMode( isDefaultMode );
    }
    if ( params?.prevScreen && params?.projectId ) {
      navigation.navigate( "TabNavigator", {
        screen: "ObservationsTab",
        params: {
          screen: "ProjectDetails",
          params: {
            id: params.projectId,
          },
        },
      } );
    } else {
      navigation.getParent( )?.goBack( );
    }
  }, [
    navigation,
    params,
    isDefaultMode,
    setIsDefaultMode,
    setLoggedInWhileInDefaultMode,
  ] );

  const scrollToItem = useCallback( ( ) => {
    firstInputFieldRef.current.measureLayout(
      scrollViewRef.current,
      ( _, y ) => {
        scrollViewRef.current.scrollTo( { y, animated: true } );
      },
      () => console.log( "Failed to measure" ),
    );
  }, [scrollViewRef] );

  useEffect( ( ) => {
    if ( keyboardShown ) {
      scrollToItem( );
    }
  }, [keyboardShown, scrollToItem] );

  const renderFooter = ( ) => (
    <>
      <Heading4
        className="color-white self-center mt-10"
      >
        {t( "OR-SIGN-IN-WITH" )}
      </Heading4>
      <View className="flex-row justify-center mt-5">
        {/*
          Note: Sign in with Apple is doable in Android if we want to:
          https://github.com/invertase/react-native-apple-authentication?tab=readme-ov-file#android
        */}
        { Platform.OS === "ios" && (
          <INatIconButton
            onPress={() => logIn( async ( ) => signInWithApple( realm ) )}
            disabled={loading}
            className="mr-8"
            icon="apple"
            // The svg icon for the Apple logo was downloaded from Apple,
            // according to the Design Guidelines it already has a margin inside the svg
            // so we scale it here to fill the entire button.
            size={50}
            color={colors.black}
            backgroundColor={colors.white}
            accessibilityLabel={t( "Sign-in-with-Apple" )}
            mode="contained"
            width={50}
            height={50}
          />
        ) }
        <INatIconButton
          onPress={() => logIn( async ( ) => signInWithGoogle( realm ) )}
          disabled={loading}
          backgroundColor={colors.white}
          accessibilityLabel={t( "Sign-in-with-Google" )}
          mode="contained"
          width={50}
          height={50}
        >
          <Image
            className="w-[20px] h-[20px]"
            source={require( "images/google.png" )}
            accessibilityIgnoresInvertColors
          />
        </INatIconButton>
      </View>
      <Trans
        className={classnames(
          "self-center mt-[31px] underline",
          // When the keyboard is up this pushes the form up enough to cut
          // off the username label on some devices
          !keyboardShown && "mb-[35px]",
        )}
        i18nKey="Dont-have-an-account"
        onPress={( ) => navigation.navigate( "SignUp" )}
        components={[
          <Body1
            key="0"
            className="text-white"
          />,
          <Body1
            key="1"
            className="text-white font-Lato-Bold"
          />,
        ]}
      />
    </>
  );

  return (
    <TouchableWithoutFeedback accessible={false} onPress={blurFields}>
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
        <View ref={firstInputFieldRef}>
          {
            !loginAgain
              ? (
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
              )
              : (
                <View className="flex-row my-5 items-center justify-center mx-2">
                  <List2 className="ml-3 text-white font-medium">
                    {t( "Please-log-in-again" )}
                  </List2>
                </View>
              )
          }
        </View>
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
            className="underline p-[15px] color-white"
            onPress={() => setIsPasswordVisible( prevState => !prevState )}
          >
            {isPasswordVisible
              ? t( "Hide" )
              : t( "Reveal" )}
          </Body2>
          <Body2
            accessibilityRole="button"
            className="underline p-[15px] color-white"
            onPress={( ) => navigation.navigate( "ForgotPassword" )}
          >
            {t( "Forgot-Password" )}
          </Body2>
        </View>
        {error && <Error error={error} />}
        <Button
          className={classnames( "mt-[30px]", {
            "mt-5": error,
          } )}
          disabled={( !loginAgain && !email ) || !password}
          forceDark
          level="focus"
          loading={loading}
          onPress={() => logIn( async () => authenticateUser(
            loginAgain
              ? currentUser.login
              : email.trim( ),
            password,
            realm,
          ) )}
          testID="Login.loginButton"
          text={t( "LOG-IN" )}
        />
        {renderFooter( )}
        {showModal && (
          <WarningSheet
            onPressClose={() => setShowModal( false )}
            headerText={t( "LOG-OUT--question" )}
            text={t( "Are-you-sure-you-want-to-log-out" )}
            handleSecondButtonPress={() => setShowModal( false )}
            secondButtonText={t( "CANCEL" )}
            confirm={onSignOut}
            buttonText={t( "LOG-OUT" )}
            loading={false}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginForm;
