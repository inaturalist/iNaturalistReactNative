// @flow

import { useRoute } from "@react-navigation/native";
import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";

import { isLoggedIn } from "./AuthenticationService";
import Header from "./Header";
import LoginForm from "./LoginForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import Logout from "./Logout";

const Login = ( ): Node => {
  const { params } = useRoute( );
  const emailConfirmed = params?.emailConfirmed;
  const [loggedIn, setLoggedIn] = useState( false );
  const [hideHeader, setHideHeader] = useState( false );

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

  const handleInputFocus = ( ) => setHideHeader( true );

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/toucan.png" )}>
      {loggedIn
        ? <Logout />
        : (
          <ScrollView
            keyboardShouldPersistTaps="always"
            // eslint-disable-next-line react-native/no-inline-styles
            contentContainerStyle={{
              flex: 1,
              justifyContent: "space-between"
            }}
          >
            {!hideHeader && (
              <Header headerText={t( "Login-sub-title" )} />
            )}
            <LoginForm
              setLoggedIn={setLoggedIn}
              handleInputFocus={handleInputFocus}
              emailConfirmed={emailConfirmed}
            />
          </ScrollView>
        )}
    </LoginSignUpWrapper>
  );
};

export default Login;
