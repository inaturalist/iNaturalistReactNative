// @flow

import { useNavigation } from "@react-navigation/native";
import {
  searchObservations
} from "api/observations";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

const newAccountConfirmedUrl = "https://www.inaturalist.org/users/sign_in?confirmed=true";
const existingAccountConfirmedUrl = "https://www.inaturalist.org/home?confirmed=true";
const observationsUrl = "https://www.inaturalist.org/observations";

const useLinking = ( currentUser: ?Object ) => {
  const navigation = useNavigation( );
  const [appLinkUrl, setAppLinkUrl] = useState( null );

  const navigateConfirmedUser = useCallback( ( ) => {
    if ( currentUser ) { return; }
    navigation.navigate( "LoginNavigator", {
      screen: "Login",
      params: { emailConfirmed: true }
    } );
  }, [navigation, currentUser] );

  const navigateToObservations = useCallback( async ( ) => {
    const id = appLinkUrl?.split( "/" )[4];
    const searchParams = { id };
    const { results } = await searchObservations( searchParams );
    const uuid = results?.[0]?.uuid;

    if ( uuid ) {
      navigation.navigate( "ObsDetails", {
        uuid
      } );
    }
  }, [navigation, appLinkUrl] );

  useEffect( ( ) => {
    Linking.addEventListener( "url", async ( { url } ) => {
      if ( !url ) { return; }
      if ( url === newAccountConfirmedUrl
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
      if ( url?.includes( observationsUrl ) ) {
        setAppLinkUrl( url );
      }
    } );
  }, [navigateConfirmedUser, navigateToObservations] );

  useEffect( ( ) => {
    const fetchInitialUrl = async ( ) => {
      const url = await Linking.getInitialURL( );

      if ( url === newAccountConfirmedUrl
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
      if ( url?.includes( observationsUrl ) ) {
        setAppLinkUrl( url );
      }
    };
    fetchInitialUrl( );
  }, [navigateConfirmedUser, navigateToObservations] );

  useEffect( ( ) => {
    if ( appLinkUrl ) {
      navigateToObservations( );
    }
  }, [appLinkUrl, navigateToObservations] );
};

export default useLinking;
