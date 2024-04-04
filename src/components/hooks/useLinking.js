// @flow

import { useNavigation } from "@react-navigation/native";
import {
  searchObservations
} from "api/observations";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

const newAccountConfirmedUrl = "https://www.inaturalist.org/users/sign_in?confirmed=true";
const existingAccountConfirmedUrl = "https://www.inaturalist.org/home?confirmed=true";

const useLinking = ( currentUser: ?Object ) => {
  const navigation = useNavigation( );
  const [observationId, setObservationId] = useState( null );

  const navigateConfirmedUser = useCallback( ( ) => {
    if ( currentUser ) { return; }
    navigation.navigate( "LoginNavigator", {
      screen: "Login",
      params: { emailConfirmed: true }
    } );
  }, [navigation, currentUser] );

  const navigateToObservations = useCallback( async ( ) => {
    const searchParams = { id: observationId };
    const { results } = await searchObservations( searchParams );
    const uuid = results?.[0]?.uuid;

    if ( uuid ) {
      navigation.navigate( "ObsDetails", {
        uuid
      } );
    }
  }, [navigation, observationId] );

  const checkAllowedHosts = useCallback( url => {
    if ( typeof url !== "string" ) { return; }
    const { host, pathname } = new URL( url );

    const allowedHosts = [
      "www.inaturalist.org"
    ];
    if ( allowedHosts?.includes( host )
      && pathname.includes( "/observations" ) ) {
      const id = pathname.split( "/" )[2];
      setObservationId( id );
    }
  }, [] );

  useEffect( ( ) => {
    Linking.addEventListener( "url", async ( { url } ) => {
      if ( !url ) { return; }
      if ( url === newAccountConfirmedUrl
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
      checkAllowedHosts( url );
    } );
  }, [navigateConfirmedUser, navigateToObservations, checkAllowedHosts] );

  useEffect( ( ) => {
    const fetchInitialUrl = async ( ) => {
      const url = await Linking.getInitialURL( );

      if ( url === newAccountConfirmedUrl
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
      checkAllowedHosts( url );
    };
    fetchInitialUrl( );
  }, [navigateConfirmedUser, navigateToObservations, checkAllowedHosts] );

  useEffect( ( ) => {
    if ( observationId ) {
      navigateToObservations( );
    }
  }, [observationId, navigateToObservations] );
};

export default useLinking;
