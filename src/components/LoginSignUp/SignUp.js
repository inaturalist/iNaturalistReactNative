// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import SignUpForm from "./SignUpForm";

const TARGET_NON_KEYBOARD_HEIGHT = 440;
const HIDE_HEADER_HEIGHT = 580;

const SignUp = ( ): Node => {
  const {
    keyboardVerticalOffset,
    nonKeyboardHeight
  } = useKeyboardInfo( TARGET_NON_KEYBOARD_HEIGHT );

  const hideHeader = nonKeyboardHeight < HIDE_HEADER_HEIGHT;
  const hideFooter = nonKeyboardHeight < HIDE_HEADER_HEIGHT;

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/frog.png" )}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <Header
        headerText={t( "Join-the-largest-community-of-naturalists" )}
        hideHeader={hideHeader}
      />
      <SignUpForm hideFooter={hideFooter} />
    </LoginSignUpWrapper>
  );
};

export default SignUp;
