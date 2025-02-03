// @flow

import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import SignUpConfirmationForm from "./SignUpConfirmationForm";

const SignUpConfirmation = ( ): Node => (
  <LoginSignUpWrapper backgroundSource={require( "images/background/plants.jpg" )}>
    <ScrollView
      keyboardShouldPersistTaps="always"
    >
      <Header headerText={t( "Almost-done" )} />
      <SignUpConfirmationForm />
    </ScrollView>
  </LoginSignUpWrapper>
);

export default SignUpConfirmation;
