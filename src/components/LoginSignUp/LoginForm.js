// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1,
  Body2,
  FullWidthButton,
  INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { TouchableWithoutFeedback } from "react-native";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import colors from "styles/tailwindColors";

import {
  authenticateUser
} from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

type Props = {
  hideFooter?: boolean,
}

const LoginForm = ( {
  hideFooter
}: Props ): Node => {
  const { params } = useRoute( );
  const emailConfirmed = params?.emailConfirmed;
  const realm = useRealm( );
  const emailRef = useRef( null );
  const passwordRef = useRef( null );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState( null );
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

  const login = async ( ) => {
    setLoading( true );
    const success = await authenticateUser(
      email.trim( ),
      password,
      realm
    );

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
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible( prevState => !prevState );
  };

  const showEmailConfirmed = ( ) => (
    <View className="flex-row mb-5 items-center justify-center mx-2">
      <View className="bg-white rounded-full">
        <INatIcon
          name="checkmark-circle"
          color={colors.inatGreen}
          size={19}
        />
      </View>
      <List2 className="ml-3 text-white font-medium">
        {t( "Your-email-is-confirmed" )}
      </List2>
    </View>
  );

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View className="px-4 mt-[9px] justify-end">
        {emailConfirmed && showEmailConfirmed( )}
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
          autoComplete="email"
          headerText={t( "USERNAME-OR-EMAIL" )}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={text => setEmail( text )}
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
          onChangeText={text => setPassword( text )}
          secureTextEntry={!isPasswordVisible}
          testID="Login.password"
          textContentType="password"
        />
        <View className="flex-row justify-between">
          <Body2
            accessibilityRole="button"
            className="underline p-4 color-white"
            onPress={() => togglePasswordVisibility()}
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
        <FullWidthButton
          className={classnames( "mt-[30px] w-full", {
            "mt-5": error
          } )}
          disabled={!email || !password}
          forceDark
          level="focus"
          loading={loading}
          onPress={login}
          testID="Login.loginButton"
          text={t( "LOG-IN" )}
        />
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
