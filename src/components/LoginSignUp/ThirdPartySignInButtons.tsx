import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import { Image, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React from "react";
import { Platform } from "react-native";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import type { AuthenticateUserResult } from "./AuthenticationService";
import { signInWithApple, signInWithGoogle } from "./loginFormHelpers";
import useApplySignInPrefs from "./useApplySignInPrefs";

const { useRealm } = RealmContext;

interface Props {
  // True while the screen is busy, including with a sign-in started here
  disabled: boolean;
  // Called with true when a sign-in starts and false when it ends. The screen
  // owns the busy state: it disables these buttons and its own submit with it.
  onBusyChange: ( busy: boolean ) => void;
  onSignedIn: ( ) => void;
}

// Sign in with Apple (iOS only) and Google. An unsuccessful sign-in does
// nothing here: a cancel needs no message, and the helpers have already
// alerted about a failure.
const ThirdPartySignInButtons = ( { disabled, onBusyChange, onSignedIn }: Props ) => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const applySignInPrefs = useApplySignInPrefs( );

  const signIn = async ( signInWithProvider: ( ) => Promise<AuthenticateUserResult> ) => {
    onBusyChange( true );
    const result = await signInWithProvider( ).finally( ( ) => onBusyChange( false ) );
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
            disabled={disabled}
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
          disabled={disabled}
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
