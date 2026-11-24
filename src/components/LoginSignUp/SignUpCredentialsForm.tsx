import { useFocusEffect } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { Keyboard } from "react-native";
import { log } from "sharedHelpers/logger";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";

import { authenticateUser, registerUser } from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";
import SignUpTermsAgreement from "./SignUpTermsAgreement";

const { useRealm } = RealmContext;

const logger = log.extend( "SignUpCredentialsForm" );

const MIN_PASSWORD_LENGTH = 6;
const USERNAME_TAKEN_SERVER_ERROR = "Username has already been taken";

interface Props {
  // Already checked as available for a new account
  email: string;
  onLearnMore: ( ) => void;
  // Called once the account is created and signed in, even if the user has
  // left the screen in the meantime
  onSignedIn: ( ) => void;
  // Called when the account is created but signing in to it fails
  onSignInFailed: ( ) => void;
  // Called with true when the account request starts and false once it
  // settles, before signing in to the new account
  onCreatingAccountChange?: ( creatingAccount: boolean ) => void;
  // Prefixes the fields' and create button's testIDs
  testID: string;
}

// Finishing an email account with a username, a password and the terms
// agreement. Where the user goes next is up to the screen hosting the form.
const SignUpCredentialsForm = ( {
  email, onLearnMore, onSignedIn, onSignInFailed, onCreatingAccountChange, testID,
}: Props ) => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const setJustFinishedSignup = useStore( state => state.layout.setJustFinishedSignup );
  const passwordRef = useRef<TextInput>( null );
  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [agreed, setAgreed] = useState( false );
  const [submitting, setSubmitting] = useState( false );
  const [error, setError] = useState<string | null>( null );
  const trimmedUsername = username.trim( );
  const canSubmit = !!trimmedUsername && !!password && agreed && !submitting;

  useFocusEffect( useCallback( ( ) => ( ) => Keyboard.dismiss( ), [] ) );

  const createAccount = async ( ) => {
    if ( password.length < MIN_PASSWORD_LENGTH ) {
      setError( t( "Please-make-sure-your-password-is-at-least-6-characters" ) );
      return;
    }
    if ( password.toLowerCase( ) === "password" ) {
      setError( t( "Please-choose-a-different-password" ) );
      return;
    }
    setError( null );
    setSubmitting( true );
    onCreatingAccountChange?.( true );
    let registrationError;
    try {
      registrationError = await registerUser( {
        email,
        login: trimmedUsername,
        password,
        // Agreeing to the terms covers both consents
        pi_consent: true,
        data_transfer_consent: true,
        preferred_observation_license: "CC-BY-NC",
        preferred_photo_license: "CC-BY-NC",
        preferred_sound_license: "CC-BY-NC",
      } );
    } catch ( registerUserError ) {
      logger.error( "Creating the account failed", registerUserError );
    }
    onCreatingAccountChange?.( false );
    // Only null means the account was created: it's undefined when the
    // request failed without a server message, e.g. when offline, or threw
    if ( registrationError !== null ) {
      if ( registrationError === USERNAME_TAKEN_SERVER_ERROR ) {
        setError( t( "That-username-is-unavailable" ) );
      } else {
        // Other errors are shown as the server worded them
        setError( registrationError || t( "Connection-problem-Please-try-again-later" ) );
      }
      setSubmitting( false );
      return;
    }
    let signedIn = false;
    try {
      const result = await authenticateUser( trimmedUsername, password, realm );
      signedIn = result.success;
    } catch ( authenticateUserError ) {
      logger.error( "Signing in to the new account failed", authenticateUserError );
    }
    setSubmitting( false );
    if ( !signedIn ) {
      onSignInFailed( );
      return;
    }
    setJustFinishedSignup( true );
    onSignedIn( );
  };

  return (
    <>
      <View className="-mx-2">
        <LoginSignUpInputField
          accessibilityLabel={t( "CHOOSE-A-USERNAME" )}
          autoComplete="username-new"
          editable={!submitting}
          headerText={t( "CHOOSE-A-USERNAME" )}
          onChangeText={( text: string ) => {
            setUsername( text );
            setError( null );
          }}
          onSubmitEditing={( ) => passwordRef.current?.focus( )}
          returnKeyType="next"
          testID={`${testID}.username`}
          textContentType="username"
        />
        <LoginSignUpInputField
          ref={passwordRef}
          accessibilityLabel={t( "PASSWORD" )}
          autoComplete="new-password"
          editable={!submitting}
          headerText={t( "PASSWORD" )}
          onChangeText={( text: string ) => {
            setPassword( text );
            setError( null );
          }}
          onSubmitEditing={( ) => {
            if ( canSubmit ) createAccount( );
          }}
          returnKeyType="go"
          secureTextEntry
          testID={`${testID}.password`}
          textContentType="newPassword"
        />
      </View>
      <SignUpTermsAgreement
        checked={agreed}
        disabled={submitting}
        onChange={setAgreed}
        onLearnMore={onLearnMore}
      />
      {error && <Error error={error} />}
      <Button
        className="mt-5"
        disabled={!canSubmit}
        level="focus"
        forceDark
        loading={submitting}
        onPress={createAccount}
        testID={`${testID}.next`}
        text={t( "CREATE-AN-ACCOUNT" )}
      />
    </>
  );
};

export default SignUpCredentialsForm;
