// @flow

import makeWebshell, {
  ForceElementSizeFeature,
  ForceResponsiveViewportFeature,
  HandleHTMLDimensionsFeature,
  HandleLinkPressFeature,
  useAutoheight
} from "@formidable-webview/webshell";
import { useNavigation } from "@react-navigation/native";
import { getJWT, USER_AGENT } from "components/LoginSignUp/AuthenticationService";
import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import inatjs from "inaturalistjs";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { WebView } from "react-native-webview";
import { useTranslation } from "sharedHooks";

const Webshell = makeWebshell(
  WebView,
  new HandleLinkPressFeature( { preventDefault: true } ),
  new HandleHTMLDimensionsFeature(),
  new ForceResponsiveViewportFeature( { maxScale: 1 } ),
  new ForceElementSizeFeature( {
    target: "body",
    heightValue: "auto",
    widthValue: "auto"
  } )
);

const AutoheightWebView = ( webshellProps ): Node => {
  const { autoheightWebshellProps } = useAutoheight( {
    webshellProps
  } );
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Webshell {...autoheightWebshellProps} />;
};

type Props = {
  currentUser: Object,
  isOnline: boolean
}

const Announcements = ( {
  currentUser,
  isOnline
}: Props ): Node => {
  const [announcements, setAnnouncements] = React.useState( undefined );

  const fetchAnnouncements = useCallback( async () => {
    const params = {
      fields: "id,body,dismissible,start,placement",
      placement: "mobile",
      locale: currentUser?.locale || "en",
      per_page: 20
    };
    const apiToken = await getJWT();
    const headers = {};
    headers["user-agent"] = USER_AGENT;
    const options = { api_token: apiToken, headers };
    inatjs.announcements
      .search( params, options )
      .then( ( { results } ) => {
        // TODO: if total_results > results, should we paginate and get more?
        // Array of { id, body, dismissible }
        const homeAnnouncements = results
          // Filter by placement on mobile home screen
          .filter( r => r.placement === "mobile/home" )
          // Sort by start date, oldest first
          .sort( ( a, b ) => new Date( a.start ) - new Date( b.start ) );
        setAnnouncements( homeAnnouncements );
      } )
      .catch( err => {
        // TODO: error handling / UI message?
        console.log( err, "err fetching announcement" );
      } );
  }, [] );

  useEffect( () => {
    // If not online or not logged in, don't fetch announcements
    if ( !isOnline || !currentUser ) {
      return;
    }
    fetchAnnouncements();
  }, [isOnline, currentUser, fetchAnnouncements] );

  const showCard
    = isOnline && announcements && announcements.length > 0 && !!currentUser;
  if ( !showCard ) {
    return null;
  }
  if ( !announcements ) {
    return null;
  }

  const topAnnouncement = announcements[0];
  const { id, dismissible, body } = topAnnouncement;

  const dismiss = async () => {
    const apiToken = await getJWT();
    const options = { api_token: apiToken, user_agent: USER_AGENT };
    inatjs.announcements
      .dismiss( { id }, options )
      .then( () => {
        // Optimistically remove the announcement from the list in state
        const newAnnouncements = announcements.filter( a => a.id !== id );
        setAnnouncements( newAnnouncements );

        // Refetch announcements
        fetchAnnouncements();
      } )
      .catch( err => {
        // TODO: error handling / UI message?
        console.log( err, "err dismissing announcement" );
      } );
  };

  return (
    <View
      className="bg-white"
      testID="announcements-container"
    >
      <AutoheightWebView
        onDOMLinkPress={onLinkPress}
        originWhitelist={["*"]}
        source={{ html: body }}
        scrollEnabled={false}
        testID="announcements-webview"
      />
      {dismissible && <Button className="m-3" text={t( "DISMISS" )} onPress={dismiss} />}
    </View>
  );
};

export default Announcements;
