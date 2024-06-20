// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback } from "react";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import Header from "./Header";
import useLoginState from "./hooks/useLoginState";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import Logout from "./Logout";

const TARGET_NON_KEYBOARD_HEIGHT = 420;
const HIDE_HEADER_HEIGHT = 560;
const HIDE_FOOTER_HEIGHT = 500;

const Login = ( ): Node => {
  const { loggedIn, setLoggedIn } = useLoginState( );
  const {
    keyboardShown,
    keyboardVerticalOffset,
    nonKeyboardHeight
  } = useKeyboardInfo( TARGET_NON_KEYBOARD_HEIGHT );

  const hideHeader = keyboardShown && ( nonKeyboardHeight < HIDE_HEADER_HEIGHT );
  const hideFooter = keyboardShown && ( nonKeyboardHeight < HIDE_FOOTER_HEIGHT );

  const renderLoginForm = useCallback( ( ) => (
    <>
      <Header
        headerText={t( "Login-sub-title" )}
        hideHeader={hideHeader}
      />
      <LoginForm
        hideFooter={hideFooter}
        setLoggedIn={setLoggedIn}
      />
    </>
  ), [hideHeader, hideFooter, setLoggedIn] );

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/toucan.png" )}
      keyboardVerticalOffset={keyboardVerticalOffset}
      scrollEnabled={!loggedIn}
    >
      {loggedIn
        ? <Logout />
        : renderLoginForm( )}
    </LoginSignUpWrapper>
  );
};

export default Login;
