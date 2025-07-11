// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Button
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import { t } from "i18next";
import type { ElementRef, Node } from "react";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { TouchableWithoutFeedback } from "react-native";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import LoginSignUpInputField from "./LoginSignUpInputField";

type Props = {
  reset: ( email: string ) => Promise<void>,
  scrollViewRef?: { current: null | ElementRef<typeof ScrollView> },
}

const ForgotPasswordForm = ( { reset, scrollViewRef }: Props ): Node => {
  const [email, setEmail] = useState( "" );
  const emailRef = useRef( null );
  const navigation = useNavigation( );
  const { keyboardShown } = useKeyboardInfo( );

  const inputFieldRef = useRef<typeof View | null>( null );

  const blurFields = () => {
    if ( emailRef.current ) {
      emailRef.current.blur();
    }
  };

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", blurFields );

    return unsubscribeBlur;
  }, [navigation] );

  useEffect( () => {
    const unsubscribeTransition = navigation.addListener( "transitionEnd", blurFields );

    return unsubscribeTransition;
  }, [navigation] );

  const scrollToItem = useCallback( ( ) => {
    if ( scrollViewRef?.current && inputFieldRef?.current ) {
      inputFieldRef.current?.measureLayout(
        scrollViewRef.current,
        ( _, y ) => {
          scrollViewRef.current?.scrollTo( { y, animated: true } );
        },
        () => console.log( "Failed to measure" )
      );
    }
  }, [scrollViewRef] );

  useEffect( ( ) => {
    if ( keyboardShown ) {
      scrollToItem( );
    }
  }, [keyboardShown, scrollToItem] );

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View className="px-4 my-5 justify-end">
        <Body1 className="text-center color-white">
          {t( "Lets-reset-your-password" )}
        </Body1>
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "EMAIL" )}
          autoComplete="email"
          headerText={t( "EMAIL" )}
          keyboardType="email-address"
          onChangeText={text => setEmail( text )}
          testID="Login.email"
        />
        <View ref={inputFieldRef}>
          <Button
            level="focus"
            forceDark
            text={t( "RESET-PASSWORD" )}
            onPress={( ) => reset( email )}
            className="my-[30px]"
            disabled={!email}
            testID="Login.forgotPasswordButton"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPasswordForm;
