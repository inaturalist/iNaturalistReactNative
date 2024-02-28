import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { getAPIToken, USER_AGENT } from "components/LoginSignUp/AuthenticationService";
import { ViewWrapper } from "components/SharedComponents";
import React, { useState } from "react";
import { Linking } from "react-native";
import WebView from "react-native-webview";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "FullPageWebView" );

const FullPageWebView = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [source, setSource] = useState( { uri: params.initialUrl } );

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
          className="h-full w-full"
          source={source}
          onShouldStartLoadWithRequest={request => {
            if ( request.url === source.uri ) return true;

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
          userAgent={USER_AGENT}
        />
      )}
    </ViewWrapper>
  );
};

export default FullPageWebView;
