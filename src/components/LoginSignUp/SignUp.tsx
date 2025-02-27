import { t } from "i18next";
import React from "react";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";

import Header from "./Header";
import LoginSignUpWrapper from "./LoginSignUpWrapper";
import SignUpForm from "./SignUpForm";

const TARGET_NON_KEYBOARD_HEIGHT = 440;
const IMAGE_STYLE = { opacity: 0.5 };

const SignUp = ( ) => {
  const {
    keyboardShown
  } = useKeyboardInfo( TARGET_NON_KEYBOARD_HEIGHT );

  const hideHeader = keyboardShown;

  return (
    <LoginSignUpWrapper
      backgroundSource={require( "images/background/birger-strahl-ksiGE4hMiso-unsplash.jpg" )}
      imageStyle={IMAGE_STYLE}
    >
      <Header
        headerText={t( "Join-the-largest-community-of-naturalists" )}
        hideHeader={hideHeader}
      />
      <SignUpForm />
    </LoginSignUpWrapper>
  );
};

export default SignUp;
