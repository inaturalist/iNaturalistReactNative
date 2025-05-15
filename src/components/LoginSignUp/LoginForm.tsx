import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1, Body2, Button, Heading4, INatIcon, INatIconButton, List2
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import { t } from "i18next";
import { navigateToTabStack } from "navigation/navigationUtils.ts";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { Trans } from "react-i18next";
import {
  Platform,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";
import { useLayoutPrefs } from "sharedHooks";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import colors from "styles/tailwindColors";

import { authenticateUser } from "./AuthenticationService";
import Error from "./Error";
import { signInWithApple, signInWithGoogle } from "./loginFormHelpers";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

interface Props {
  scrollViewRef?: React.Ref
}

interface LoginFormParams {
  emailConfirmed?: boolean;
  prevScreen?: string;
  projectId?: number;
}

type ParamList = {
  LoginFormParams: LoginFormParams
}

const LoginForm = ( {
  scrollViewRef
}: Props ) => {
  const navigation = useNavigation( );
  const { params } = useRoute<RouteProp<ParamList, "LoginFormParams">>( );
  const emailConfirmed = params?.emailConfirmed;
  const realm = useRealm( );
  const { isDefaultMode, setLoggedInWhileInDefaultMode } = useLayoutPrefs( );
  const firstInputFieldRef = useRef( null );
  const emailRef = useRef<TextInput>( null );
  const passwordRef = useRef<TextInput>( null );
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

    // Set a state to zustand that we just logged in while in default mode
    setLoggedInWhileInDefaultMode( isDefaultMode );
    if ( params?.prevScreen && params?.projectId ) {
      navigateToTabStack( "ProjectDetails", {
        id: params?.projectId
      } );
    } else {
      navigation.getParent( )?.goBack( );
    }
  }, [
    navigation,
    params,
    isDefaultMode,
    setLoggedInWhileInDefaultMode
  ] );

  const scrollToItem = useCallback( ( ) => {
    firstInputFieldRef.current.measureLayout(
      scrollViewRef.current,
      ( _, y ) => {
        scrollViewRef.current.scrollTo( { y, animated: true } );
      },
      () => console.log( "Failed to measure" )
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
          !keyboardShown && "mb-[35px]"
        )}
        i18nKey="Dont-have-an-account"
        onPress={( ) => navigation.navigate( "SignUp" )}
        components={[
          <Body1 className="text-white" />,
          <Body1
            className="text-white font-Lato-Bold"
          />
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
        {renderFooter( )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginForm;
