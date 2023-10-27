// @flow

import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import SignUpForm from "./SignUpForm";

const TARGET_NON_KEYBOARD_HEIGHT = 440;

const SignUp = (): Node => {
  const { nonKeyboardHeight } = useKeyboardInfo( );

  const hideHeader = nonKeyboardHeight < 580;

  const keyboardVerticalOffset = nonKeyboardHeight < TARGET_NON_KEYBOARD_HEIGHT
    ? nonKeyboardHeight - TARGET_NON_KEYBOARD_HEIGHT
    : 30;

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/frog.png" )}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
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
        <SignUpForm />
      </ScrollView>
    </LoginSignUpWrapper>
  );
};

export default SignUp;
