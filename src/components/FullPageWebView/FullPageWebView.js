import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { getAPIToken } from "components/LoginSignUp/AuthenticationService";
import { ViewWrapper } from "components/SharedComponents";
import React, { useState } from "react";
import WebView from "react-native-webview";

const FullPageWebView = () => {
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

            setSource( { ...source, uri: request.url } );
            return false;
          }}
        />
      )}
    </ViewWrapper>
  );
};

export default FullPageWebView;
