// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body2,
  Button,
  Checkbox,
  UnderlinedLink
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";

import {
  authenticateUser,
  registerUser
} from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

const SignUpConfirmationForm = ( ): Node => {
  const realm = useRealm( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { user } = params;

  const usernameRef = useRef( null );
  const passwordRef = useRef( null );

  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState( null );

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

  const onLearnMorePressed = async () => {
    const url = "https://www.inaturalist.org/pages/terms";
    navigation.navigate( "FullPageWebView", {
      title: t( "TERMS-OF-USE" ),
      initialUrl: url,
      loggedIn: false
    } );
  };

  const register = async ( ) => {
    if ( loading ) { return; }
    setLoading( true );
    user.login = username;
    user.password = password;
    user.pi_consent = true;
    user.data_transfer_consent = true;
    if ( checkboxes.first.checked === true ) {
      user.preferred_observation_license = "CC-BY-NC";
      user.preferred_photo_license = "CC-BY-NC";
      user.preferred_sound_license = "CC-BY-NC";
    }
    const registrationError = await registerUser( user );
    if ( registrationError ) {
      setError( registrationError );
      setLoading( false );
      return;
    }
    const success = await authenticateUser( user.login, user.password, realm );
    setLoading( false );
    if ( !success ) {
      navigation.navigate( "Login" );
      return;
    }
    navigation.navigate( "TabNavigator" );
  };

  return (
    <View className="px-3 mt-[9px] justify-end">
      <LoginSignUpInputField
        ref={usernameRef}
        accessibilityLabel={t( "CHOOSE-A-USERNAME" )}
        headerText={t( "CHOOSE-A-USERNAME" )}
        onChangeText={text => setUsername( text )}
        testID="Signup.username"
        textContentType="username"
      />
      <LoginSignUpInputField
        ref={passwordRef}
        accessibilityLabel={t( "PASSWORD" )}
        autoComplete="new-password"
        headerText={t( "PASSWORD" )}
        onChangeText={text => setPassword( text )}
        secureTextEntry
        testID="Signup.password"
        textContentType="newPassword"
      />
      <View className="flex-row mt-5 mx-2 items-start">
        <Checkbox
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
            onPress={onLearnMorePressed}
          >
            {t( "Learn-More" )}
          </UnderlinedLink>
        </View>
      </View>
      {error && <Error error={error} />}
      <Button
        level="focus"
        text={t( "CREATE-AN-ACCOUNT" )}
        onPress={register}
        className="my-5"
        loading={loading}
        disabled={loading || !username || !password || !checked}
        testID="SignUpConfirmationForm.signupButton"
      />
    </View>
  );
};

export default SignUpConfirmationForm;
