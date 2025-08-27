import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import { getUserAgent } from "api/userAgent.ts";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { ActivityIndicator, Mortal, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Linking } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import WebView from "react-native-webview";
import { log } from "sharedHelpers/logger";
import { composeEmail } from "sharedHelpers/mail.ts";
import { useFontScale } from "sharedHooks";

const logger = log.extend( "FullPageWebView" );

export const ALLOWED_DOMAINS = [
  "inaturalist.org",

  // The following are all required for the donorbox form to work
  "donorbox.org",
  "stripe.com",
  "recaptcha.net",
  "paypal.com",
  "paypalobjects.com",
  "plaid.com",
  "stripecdn.com",
  "stripe.network",
  "hcaptcha.com"
];

const ALLOWED_ORIGINS = ["https://*", "mailto:*"];
const ALLOWED_AUTH_DOMAINS = ["inaturalist.org"];

// eslint-disable-next-line no-undef
if ( __DEV__ ) {
  ALLOWED_DOMAINS.push( "localhost:3000" );
  ALLOWED_ORIGINS.push( "http://localhost:3000*" );
  ALLOWED_AUTH_DOMAINS.push( "localhost:3000" );
}

// Note that you want flex-2 so it grows into the entire webview container
const LoadingView = ( ) => (
  <View className="flex-2 justify-center items-center w-full h-full">
    <ActivityIndicator />
  </View>
);

type FullPageWebViewParams = {
  initialUrl: string;
  blurEvent?: string;
  title?: string;
  loggedIn?: boolean;
  skipSetSourceInShouldStartLoadWithRequest?: boolean;
  clickablePathnames?: Array<string>;
  shouldLoadUrl?: ( url: string ) => boolean;
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
  if ( typeof ( params.shouldLoadUrl ) === "function" ) {
    if ( !params.shouldLoadUrl( request.url ) ) return false;
  }

  // If we're just loading the same page, that's fine
  if ( request.url === source.uri ) {
    return true;
  }

  // If we're going to a different anchor on the same page, also fine
  const requestUrl = new URL( request.url );
  const requestDomain = requestUrl.host.split( "." ).slice( -2 ).join( "." );
  const sourceUrl = new URL( source.uri );
  const sourceDomain = sourceUrl.host.split( "." ).slice( -2 ).join( "." );

  // This should prevent accidentally making a webview with auth for a
  // non-iNat domain
  if ( source.headers?.Authorization && ALLOWED_AUTH_DOMAINS.indexOf( sourceDomain ) < 0 ) {
    throw new Error( "Cannot send Authorization to non-iNat domain" );
  }

  // We do want to handle requests for the same page
  if (
    requestUrl.host === sourceUrl.host
    && requestUrl.pathname === sourceUrl.pathname
    && requestUrl.search === sourceUrl.search
  ) {
    return true;
  }

  const emailAddress = request.url.match( /^mailto:(.+)/ )?.[1];
  if ( emailAddress ) {
    composeEmail( emailAddress );
    return false;
  }

  // Otherwise we might want to open a browser
  if (
    // If the user is about to visit a domain we don't want to handle
    !ALLOWED_DOMAINS.includes( requestDomain )
    // or if this is a click, i.e. even if this is an allowed domain, we want
    // to open a browser unless we were explicitly asked not to. This only
    // works in iOS.
    || (
      // TODO come up with an Android solution
      request.navigationType === "click"
      && ( params.clickablePathnames || [] ).indexOf( requestUrl.pathname ) < 0
    )
  ) {
    // Note we can't use openExternalWebBrowser here b/c this function needs
    // to be synchronous
    Linking.openURL( request.url ).catch( e => {
      const linkingError = e as Error;
      logger.info( "Failed to open ", request.url, ", error: ", linkingError );
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
  "use no memo";

  const navigation = useNavigation( );
  const { params } = useRoute<RouteProp<ParamList, "FullPageWebView">>( );
  const [source, setSource] = useState<WebViewSource>( { uri: params.initialUrl } );
  const { isLargeFontScale } = useFontScale();

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
      if ( params.loggedIn ) {
        getJWT().then( jwt => {
          setSource( {
            ...source,
            headers: {
              Authorization: jwt
            }
          } );
        } );
      }
      // TODO: I am not sure how to make the react compiler happy here, so I disabled it
      // for this hook
      // eslint-disable-next-line react-hooks/react-compiler
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, params.loggedIn, params.title] )
  );

  const fontScalingJS = `
    if( ${isLargeFontScale} ){
      document.getElementById("wrapper").style.fontSize = '2rem';
      let paragraphs = document.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.style.fontSize = '3rem';
      })
    }
    true; 
    // note: string should evaluate to vaild type, can throw exception otherwise
    // https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#injectedjavascript
  `;

  return (
    <Mortal>
      <ViewWrapper>
        {( !params.loggedIn || source.headers ) && (
          <WebView
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onMessage={() => { }} // onMessage prop required to inject JS into webview
            injectedJavaScript={fontScalingJS}
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
            originWhitelist={ALLOWED_ORIGINS}
            renderLoading={LoadingView}
            startInLoadingState
            userAgent={getUserAgent()}
            onOpenWindow={() => true}
          />
        )}
      </ViewWrapper>
    </Mortal>
  );
};

export default FullPageWebView;
