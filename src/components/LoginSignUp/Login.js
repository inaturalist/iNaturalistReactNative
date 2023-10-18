// @flow

import { useRoute } from "@react-navigation/native";
import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard
} from "react-native";

import { isLoggedIn } from "./AuthenticationService";
import Header from "./Header";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import Logout from "./Logout";

const SCROLL_VIEW_STYLE = {
  flex: 1,
  justifyContent: "space-between"
};

const Login = ( ): Node => {
  const { params } = useRoute( );
  const emailConfirmed = params?.emailConfirmed;
  const [loggedIn, setLoggedIn] = useState( false );
  const [keyboardShown, setKeyboardShown] = useState( false );
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const nonKeyboardHeight = Dimensions.get( "screen" ).height - keyboardHeight;

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLoggedIn = async ( ) => {
      const login = await isLoggedIn( );
      if ( !isCurrent ) { return; }
      setLoggedIn( login );
    };

    fetchLoggedIn( );

    return ( ) => {
      isCurrent = false;
    };
  }, [loggedIn] );

  useEffect( ( ) => {
    const showSubscription = Keyboard.addListener( "keyboardDidShow", keyboardDidShowEvent => {
      setKeyboardHeight( keyboardDidShowEvent.endCoordinates.height );
      setKeyboardShown( true );
    } );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", keyboardDidHideEvent => {
      setKeyboardHeight( keyboardDidHideEvent.endCoordinates.height );
      setKeyboardShown( false );
    } );

    return () => {
      showSubscription.remove( );
      hideSubscription.remove( );
    };
  }, [] );

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/toucan.png" )}>
      {loggedIn
        ? <Logout />
        : (
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={SCROLL_VIEW_STYLE}
          >
            <Header
              hideLogo={nonKeyboardHeight < 470}
              headerText={
                nonKeyboardHeight < 540 && keyboardShown
                  ? undefined
                  : t( "Login-sub-title" )
              }
            />
            <LoginForm
              setLoggedIn={setLoggedIn}
              emailConfirmed={emailConfirmed}
            />
          </ScrollView>
        )}
    </LoginSignUpWrapper>
  );
};

export default Login;
