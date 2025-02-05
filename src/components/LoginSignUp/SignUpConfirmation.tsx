import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import React from "react";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import SignUpConfirmationForm from "./SignUpConfirmationForm";

const SignUpConfirmation = ( ) => (
  <LoginSignUpWrapper backgroundSource={require( "images/background/plants.jpg" )}>
    <ScrollView
      keyboardShouldPersistTaps="always"
    >
      <Header headerText={t( "Join-the-largest-community-of-naturalists" )} />
      <SignUpConfirmationForm />
    </ScrollView>
  </LoginSignUpWrapper>
);

export default SignUpConfirmation;
