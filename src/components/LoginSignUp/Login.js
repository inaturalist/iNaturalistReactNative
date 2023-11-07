// @flow

import { useRoute } from "@react-navigation/native";
import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import { isLoggedIn } from "./AuthenticationService";
import Header from "./Header";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import Logout from "./Logout";

const SCROLL_VIEW_STYLE = {
  flex: 1,
  justifyContent: "space-between"
};

const TARGET_NON_KEYBOARD_HEIGHT = 420;

const Login = ( ): Node => {
  const { params } = useRoute( );
  const emailConfirmed = params?.emailConfirmed;
  const [loggedIn, setLoggedIn] = useState( false );
  const { keyboardShown, nonKeyboardHeight } = useKeyboardInfo( );

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

  const keyboardVerticalOffset = nonKeyboardHeight < TARGET_NON_KEYBOARD_HEIGHT
    ? nonKeyboardHeight - TARGET_NON_KEYBOARD_HEIGHT
    : 30;

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/toucan.png" )}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {loggedIn
        ? <Logout onLogOut={() => setLoggedIn( false )} />
        : (
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={SCROLL_VIEW_STYLE}
          >
            <Header
              hideLogo={nonKeyboardHeight < 520}
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
