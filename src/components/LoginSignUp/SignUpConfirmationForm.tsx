import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body2,
  Button,
  Checkbox,
  UnderlinedLink
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { navigateToTabStack } from "navigation/navigationUtils.ts";
import { RealmContext } from "providers/contexts.ts";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import { TextInput, TouchableWithoutFeedback } from "react-native";

import {
  authenticateUser,
  registerUser
} from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

const SignUpConfirmationForm = ( ) => {
  const realm = useRealm( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { user }: {
    email: string;
  } = params;

  const usernameRef = useRef<TextInput>( null );
  const passwordRef = useRef<TextInput>( null );

  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState<string>( );

  const [checked, setChecked] = useState( false );
  const [loading, setLoading] = useState( false );

  const blurFields = () => {
    if ( usernameRef.current ) {
      usernameRef.current.blur();
    }
    if ( passwordRef.current ) {
      passwordRef.current.blur();
    }
  };

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", blurFields );

    return unsubscribeBlur;
  }, [navigation] );

  useEffect( () => {
    const unsubscrubeTransition = navigation.addListener( "transitionEnd", blurFields );

    return unsubscrubeTransition;
  }, [navigation] );

  const register = async ( ) => {
    if ( loading ) { return; }
    setLoading( true );
    user.login = username;
    // If password is less than 6 characters set error and return
    if ( password.length < 6 ) {
      setError( t( "Please-make-sure-your-password-is-at-least-6-characters" ) );
      setLoading( false );
      return;
    }
    // If password is "password" set error and return
    if ( password.toLowerCase() === "password" ) {
      setError( t( "Please-choose-a-different-password" ) );
      setLoading( false );
      return;
    }
    user.password = password;
    // Because checked === true, the following items are considered to be consented too
    user.pi_consent = true;
    user.data_transfer_consent = true;
    user.preferred_observation_license = "CC-BY-NC";
    user.preferred_photo_license = "CC-BY-NC";
    user.preferred_sound_license = "CC-BY-NC";
    const registrationError = await registerUser( user );
    if ( registrationError ) {
      // Currently the error is a string coming directly from the server
      if ( registrationError === "Username has already been taken" ) {
        setError( t( "That-username-is-unavailable" ) );
      } else {
        setError( registrationError );
      }
      setLoading( false );
      return;
    }
    const success = await authenticateUser( user.login, user.password, realm );
    setLoading( false );
    if ( !success ) {
      navigation.navigate( "Login" );
      return;
    }
    navigateToTabStack( "ObsList", {
      justFinishedSignup: true
    } );
  };

  return (
    <TouchableWithoutFeedback accessible={false} onPress={blurFields}>
      <View className="px-3 mt-[9px] justify-end">
        <LoginSignUpInputField
          ref={usernameRef}
          accessibilityLabel={t( "CHOOSE-A-USERNAME" )}
          headerText={t( "CHOOSE-A-USERNAME" )}
          onChangeText={( text: string ) => setUsername( text )}
          testID="Signup.username"
          textContentType="username"
        />
        <LoginSignUpInputField
          ref={passwordRef}
          accessibilityLabel={t( "PASSWORD" )}
          autoComplete="new-password"
          headerText={t( "PASSWORD" )}
          onChangeText={( text: string ) => setPassword( text )}
          secureTextEntry
          testID="Signup.password"
          textContentType="newPassword"
        />
        <View className="flex-row mt-5 mx-2 items-start">
          <Checkbox
            accessibilityLabel={t( "I-agree-to-the-Terms-of-Use" )}
            transparent
            isChecked={checked}
            onPress={() => {
              setChecked( !checked );
            }}
          />
          <View className="flex-1">
            <Trans
              className="flex-wrap"
              i18nKey="I-agree-to-the-Terms-of-Use"
              onPress={() => setChecked( !checked )}
              components={[
                <Body2 className="text-white" />,
                <Body2 className="text-white font-Lato-Italic" />
              ]}
            />
            <UnderlinedLink
              className="color-white mt-[9px]"
              onPress={() => navigation.navigate( "LearnMore" )}
            >
              {t( "Learn-More" )}
            </UnderlinedLink>
          </View>
        </View>
        {error && <Error error={error} />}
        <Button
          level="focus"
          forceDark
          text={t( "CREATE-AN-ACCOUNT" )}
          onPress={register}
          className="my-5"
          loading={loading}
          disabled={loading || !username || !password || !checked}
          testID="SignUpConfirmationForm.signupButton"
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUpConfirmationForm;
