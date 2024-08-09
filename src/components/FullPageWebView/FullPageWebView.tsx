import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import { getUserAgent } from "api/userAgent";
import { getAPIToken } from "components/LoginSignUp/AuthenticationService.ts";
import { ActivityIndicator, Mortal, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Mailer from "react-native-mail";
import WebView from "react-native-webview";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "FullPageWebView" );

export const ALLOWED_DOMAINS = [
  "inaturalist.org",
  "donorbox.org",
  "stripe.com",
  "recaptcha.net",
  "paypalobjects.com",
  "stripecdn.com",
  "stripe.network",
  "hcaptcha.com"
];

// Note that you want flex-2 so it grows into the entire webview container
const LoadingView = ( ) => (
  <View className="flex-2 justify-center items-center w-full h-full">
    <ActivityIndicator />
  </View>
);

type FullPageWebViewParams = {
  initialUrl: string,
  blurEvent?: string,
  title?: string,
  loggedIn?: boolean,
  handleLinksForAllowedDomains?: boolean,
  skipSetSourceInShouldStartLoadWithRequest?: boolean
}

type ParamList = {
  FullPageWebView: FullPageWebViewParams
}

type WebViewSource = {
  uri: string;
  headers?: {
    Authorization?: string | null
  }
}

type WebViewRequest = {
  url: string;
  navigationType: "click" | "other"
}

export function onShouldStartLoadWithRequest(
  request: WebViewRequest,
  source: WebViewSource,
  params: FullPageWebViewParams,
  setSource?: ( source: WebViewSource ) => void
) {
  // If we're just loading the same page, that's fine
  if ( request.url === source.uri ) {
    return true;
  }

  // If we're going to a different anchor on the same page, also fine
  const requestUrl = new URL( request.url );
  const requestDomain = requestUrl.host.split( "." ).slice( -2 ).join( "." );
  const sourceUrl = new URL( source.uri );
  if (
    requestUrl.host === sourceUrl.host
    && requestUrl.pathname === sourceUrl.pathname
    && requestUrl.search === sourceUrl.search
  ) {
    return true;
  }

  const emailAddress = request.url.match( /^mailto:(.+)/ )?.[1];
  if ( emailAddress ) {
    Mailer.mail( {
      recipients: [emailAddress]
    }, ( error: string ) => {
      if ( Platform.OS === "ios" && error === "not_available" ) {
        Alert.alert(
          t( "Looks-like-youre-not-using-Apple-Mail" ),
          emailAddress
        );
        return;
      }
      if ( error ) {
        Alert.alert( t( "Something-went-wrong" ), error );
      }
    } );
    return false;
  }

  // Otherwise we might want to open a browser
  if (
    // If we're not explicitly trying to keep the user inside the app
    !params.handleLinksForAllowedDomains
    // or if the user is about to visit a domain we don't want to handle
    || !ALLOWED_DOMAINS.includes( requestDomain )
    // or if this is a click, i.e. even if this is an allowed domain, we want
    // to open a browser unless we were explicitly asked not to. This only
    // works in iOS.
    || ( !params.handleLinksForAllowedDomains && request.navigationType === "click" )
  ) {
    Linking.openURL( request.url ).catch( linkingError => {
      logger.info( "User refused to open ", request.url, ", error: ", linkingError );
    } );
    return false;
  }

  if ( params.skipSetSourceInShouldStartLoadWithRequest || !setSource ) {
    return true;
  }

  // Note: this will cause infinite re-renders if the page has iframes
  setSource( { ...source, uri: request.url } );
  return true;
}

const FullPageWebView = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute<RouteProp<ParamList, "FullPageWebView">>( );
  const [source, setSource] = useState<WebViewSource>( { uri: params.initialUrl } );

  // If the previous screen wanted to know when this one blurs, fire off an
  // event when that happens
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      if ( params.blurEvent ) {
        EventRegister.emit( params.blurEvent );
      }
    } );
    return unsubscribe;
  }, [navigation, params.blurEvent] );

  useFocusEffect(
    React.useCallback( () => {
      if ( params.title ) {
        navigation.setOptions( {
          headerTitle: params.title
        } );
      }

      setSource( {
        ...source,
        uri: params.initialUrl
      } );

      // Make the WebView logged in for the current user
      // TODO: make sure this isn't spewing JWTs to any old site
      if ( params.loggedIn ) {
        getAPIToken().then( token => {
          setSource( {
            ...source,
            headers: {
              Authorization: token
            }
          } );
        } );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, params.loggedIn, params.title] )
  );

  return (
    <Mortal>
      <ViewWrapper>
        {( !params.loggedIn || source.headers ) && (
          <WebView
            className="h-full w-full flex-1"
            source={source}
            onShouldStartLoadWithRequest={
              ( request: WebViewRequest ) => onShouldStartLoadWithRequest(
                request,
                source,
                params,
                setSource
              )
            }
            originWhitelist={["https://*", "mailto:*"]}
            renderLoading={LoadingView}
            startInLoadingState
            userAgent={getUserAgent()}
          />
        )}
      </ViewWrapper>
    </Mortal>
  );
};

export default FullPageWebView;
