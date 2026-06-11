import { t } from "i18next";
import React, { useRef } from "react";
import type { ScrollView } from "react-native";

import Header from "./Header";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const Login = ( ) => {
  const scrollViewRef = useRef<ScrollView>( null );

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/background/toucan.jpg" )}
      scrollViewRef={scrollViewRef}
    >
      <Header
        headerText={t( "A-global-community-for-nature" )}
      />
      <LoginForm
        scrollViewRef={scrollViewRef}
      />
    </LoginSignUpWrapper>
  );
};

export default Login;
