// @flow

import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import SignUpForm from "./SignUpForm";

const SignUp = (): Node => {
  const [hideHeader, setHideHeader] = useState( false );

  const handleInputFocus = ( ) => setHideHeader( true );

  return (
    <LoginSignUpWrapper backgroundSource={require( "images/frog.png" )}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{
          flex: 1,
          justifyContent: "space-between"
        }}
      >
        {!hideHeader && (
          <Header headerText={t( "Join-the-largest-community-of-naturalists" )} />
        )}
        <SignUpForm handleInputFocus={handleInputFocus} />
      </ScrollView>
    </LoginSignUpWrapper>
  );
};

export default SignUp;
