import { t } from "i18next";
import React, { useCallback } from "react";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import Header from "./Header";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const TARGET_NON_KEYBOARD_HEIGHT = 420 as const;

const Login = ( ) => {
  const {
    keyboardShown,
    keyboardVerticalOffset
  } = useKeyboardInfo( TARGET_NON_KEYBOARD_HEIGHT );

  const hideHeader = keyboardShown;
  const hideFooter = keyboardShown;

  console.log( hideFooter, "hide footer" );

  const renderLoginForm = useCallback( ( ) => (
    <>
      <Header
        headerText={t( "Login-sub-title" )}
        hideHeader={hideHeader}
      />
      <LoginForm
        hideFooter={hideFooter}
      />
    </>
  ), [hideHeader, hideFooter] );

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/background/toucan.jpg" )}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {renderLoginForm( )}
    </LoginSignUpWrapper>
  );
};

export default Login;
