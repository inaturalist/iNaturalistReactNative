// @flow

import { useNavigation } from "@react-navigation/native";
import {
  searchObservations
} from "api/observations";
import navigateToCamera from "components/Camera/helpers/navigateToCamera";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import navigateToObsDetails from "components/ObsDetails/helpers/navigateToObsDetails";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

const cameraUrl = "https://www.inaturalist.org/app/ai_camera";
const fakeCameraUrl = "https://www.inaturalist.org/observations/1";
const newAccountConfirmedUrl = "https://www.inaturalist.org/users/sign_in?confirmed=true";
const existingAccountConfirmedUrl = "https://www.inaturalist.org/home?confirmed=true";

const useLinking = ( currentUser: ?Object ) => {
  const navigation = useNavigation( );
  const [observationId, setObservationId] = useState( null );

  const navigateConfirmedUser = useCallback( ( ) => {
    if ( currentUser ) { return; }
    navigation.navigate( "LoginStackNavigator", {
      screen: "Login",
      params: { emailConfirmed: true }
    } );
  }, [navigation, currentUser] );

  const navigateCamera = useCallback( async () => {
    navigateToCamera( navigation );
  }, [navigation] );

  const navigateToObservations = useCallback( async () => {
    const searchParams = { id: observationId };
    const apiToken = await getJWT( );
    const options = {
      api_token: apiToken
    };
    const { results } = await searchObservations( searchParams, options );
    const uuid = results?.[0]?.uuid;

    if ( uuid ) {
      navigateToObsDetails( navigation, uuid );
      // ObsId reset for the case the same link is pressed twice and the obsId is the same
      setObservationId( null );
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

  const handleUrl = useCallback( url => {
    if ( url === newAccountConfirmedUrl
      || url === existingAccountConfirmedUrl
    ) {
      navigateConfirmedUser();
    } else if ( url === cameraUrl ) {
      navigateCamera();
    } else if ( url === fakeCameraUrl ) {
      navigateCamera();
    } else {
      checkAllowedHosts( url );
    }
  }, [navigateConfirmedUser, navigateCamera, checkAllowedHosts] );

  useEffect( ( ) => {
    Linking.addEventListener( "url", async ( { url } ) => {
      if ( !url ) { return; }
      handleUrl( url );
    } );
  }, [handleUrl] );

  useEffect( ( ) => {
    const fetchInitialUrl = async ( ) => {
      const url = await Linking.getInitialURL( );
      handleUrl( url );
    };
    fetchInitialUrl( );
  }, [handleUrl] );

  useEffect( () => {
    if ( observationId && parseInt( observationId, 10 ) === 1 ) {
      // no such observation as obs id 1.
      // so launch the camera.
      // this doesn't work as an iniital url, but
      // can work if the app is launched and backgrounded
      navigateCamera();
    } else if ( observationId ) {
      navigateToObservations();
    }
  }, [observationId, navigateCamera, navigateToObservations] );
};

export default useLinking;
