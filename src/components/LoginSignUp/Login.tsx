import { t } from "i18next";
import React, { useCallback } from "react";

import Header from "./Header";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const Login = ( ) => {
  const renderLoginForm = useCallback( ( { scrollViewRef } ) => (
    <>
      <Header
        headerText={t( "Login-sub-title" )}
      />
      <LoginForm
        scrollViewRef={scrollViewRef}
      />
    </>
  ), [] );

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/background/toucan.jpg" )}
    >
      {renderLoginForm}
    </LoginSignUpWrapper>
  );
};

export default Login;
