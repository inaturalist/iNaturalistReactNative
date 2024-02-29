import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { getAPIToken, USER_AGENT } from "components/LoginSignUp/AuthenticationService";
import { ActivityIndicator, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect, useState } from "react";
import { Linking } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import WebView from "react-native-webview";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "FullPageWebView" );

// Note that you want flex-2 so it grows into the entire webview container
const LoadingView = ( ) => (
  <View className="flex-2 justify-center items-center w-full h-full">
    <ActivityIndicator />
  </View>
);

const FullPageWebView = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [source, setSource] = useState( { uri: params.initialUrl } );

  // If the previous screen wanted to know when this one blurs, fire off an
  // event when that happens
  useEffect( ( ) => {
    if ( params.blurEvent ) {
      const unsubscribe = navigation.addListener( "blur", ( ) => {
        EventRegister.emit( params.blurEvent );
      } );
      return unsubscribe;
    }
    return ( ) => { };
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
    <ViewWrapper>
      {( !params.loggedIn || source.headers ) && (
        <WebView
          className="h-full w-full flex-1"
          source={source}
          onShouldStartLoadWithRequest={request => {
            // If we're just loading the same page, that's fine
            if ( request.url === source.uri ) return true;

            // If we're going to a different anchor on the same page, also fine
            const requestUrl = new URL( request.url );
            const sourceUrl = new URL( source.uri );
            if (
              requestUrl.host === sourceUrl.host
              && requestUrl.search === sourceUrl.search
            ) {
              return true;
            }

            // Otherwise we might want to open a browser
            if ( params.openLinksInBrowser ) {
              Linking.openURL( request.url ).catch( linkingError => {
                logger.info( "User refused to open ", request.url, ", error: ", linkingError );
              } );
              return false;
            }

            // Note: this will cause infinite re-renders if the page has
            // iframes
            setSource( { ...source, uri: request.url } );
            return true;
          }}
          renderLoading={LoadingView}
          startInLoadingState
          userAgent={USER_AGENT}
        />
      )}
    </ViewWrapper>
  );
};

export default FullPageWebView;
