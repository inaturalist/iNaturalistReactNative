import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import { Image, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useState } from "react";
import { Platform } from "react-native";
import { log } from "sharedHelpers/logger";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import type { AuthenticateUserResult } from "./AuthenticationService";
import { signInWithApple, signInWithGoogle } from "./loginFormHelpers";
import useApplySignInPrefs from "./useApplySignInPrefs";

const { useRealm } = RealmContext;

const logger = log.extend( "ThirdPartySignInButtons" );

interface Props {
  // Disables the buttons while the screen is busy with something else, like
  // a username/password login
  disabled?: boolean;
  // Called with true when a sign-in starts and false when it ends, so the
  // screen can show it's busy and hold off its own submit
  onBusyChange?: ( busy: boolean ) => void;
  onSignedIn: ( ) => void;
}

// Sign in with Apple (iOS only) and Google. An unsuccessful sign-in does
// nothing here: a cancel needs no message, and the helpers have already
// alerted about a failure. An unexpected error is only logged.
const ThirdPartySignInButtons = ( { disabled = false, onBusyChange, onSignedIn }: Props ) => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const applySignInPrefs = useApplySignInPrefs( );
  const [signingIn, setSigningIn] = useState( false );
  const buttonsDisabled = disabled || signingIn;

  const setBusy = ( busy: boolean ) => {
    setSigningIn( busy );
    onBusyChange?.( busy );
  };

  const signIn = async ( signInWithProvider: ( ) => Promise<AuthenticateUserResult> ) => {
    setBusy( true );
    let result: AuthenticateUserResult;
    try {
      result = await signInWithProvider( );
    } catch ( signInError ) {
      logger.error( "Third-party sign-in failed unexpectedly", signInError );
      result = { success: false };
    } finally {
      setBusy( false );
    }
    if ( !result.success ) return;
    applySignInPrefs( result.observationsCount );
    onSignedIn( );
  };

  return (
    <View>
      <Heading4 className="color-white self-center">
        {t( "OR-SIGN-IN-WITH" )}
      </Heading4>
      <View className="flex-row justify-center mt-5">
        { Platform.OS === "ios" && (
          <INatIconButton
            onPress={( ) => signIn( ( ) => signInWithApple( realm ) )}
            disabled={buttonsDisabled}
            className="mr-8"
            icon="apple"
            // The svg icon for the Apple logo was downloaded from Apple,
            // according to the Design Guidelines it already has a margin inside the svg
            // so we scale it here to fill the entire button.
            size={50}
            color={colors.black}
            backgroundColor={colors.white}
            accessibilityLabel={t( "Sign-in-with-Apple" )}
            mode="contained"
            width={50}
            height={50}
            testID="ThirdPartySignIn.apple"
          />
        ) }
        <INatIconButton
          onPress={( ) => signIn( ( ) => signInWithGoogle( realm ) )}
          disabled={buttonsDisabled}
          backgroundColor={colors.white}
          accessibilityLabel={t( "Sign-in-with-Google" )}
          mode="contained"
          width={50}
          height={50}
          testID="ThirdPartySignIn.google"
        >
          <Image
            className="w-[20px] h-[20px]"
            source={require( "images/google.png" )}
            accessibilityIgnoresInvertColors
          />
        </INatIconButton>
      </View>
    </View>
  );
};

export default ThirdPartySignInButtons;
