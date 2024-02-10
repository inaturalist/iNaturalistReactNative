// @flow

import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { Linking } from "react-native";

const useLinking = ( currentUser: ?Object ) => {
  const navigation = useNavigation( );
  const navigateConfirmedUser = useCallback( ( ) => {
    if ( currentUser ) { return; }
    navigation.navigate( "LoginNavigator", {
      screen: "Login",
      params: { emailConfirmed: true }
    } );
  }, [navigation, currentUser] );

  const newAccountConfirmedUrl = "https://www.inaturalist.org/users/sign_in?confirmed=true";
  const existingAccountConfirmedUrl = "https://www.inaturalist.org/home?confirmed=true";
  // const testUrl = "https://www.inaturalist.org/observations";

  useEffect( ( ) => {
    Linking.addEventListener( "url", async ( { url } ) => {
      if ( url === newAccountConfirmedUrl
        // || url.includes( testUrl )
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
    } );
  }, [navigateConfirmedUser] );

  useEffect( ( ) => {
    const fetchInitialUrl = async ( ) => {
      const url = await Linking.getInitialURL( );

      if ( url === newAccountConfirmedUrl
        // || url?.includes( testUrl )
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
    };
    fetchInitialUrl( );
  }, [navigateConfirmedUser] );
};

export default useLinking;
