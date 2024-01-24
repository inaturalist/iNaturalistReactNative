// @flow

import makeWebshell, {
  ForceElementSizeFeature,
  ForceResponsiveViewportFeature,
  HandleHTMLDimensionsFeature,
  HandleLinkPressFeature,
  useAutoheight
} from "@formidable-webview/webshell";
import { useQueryClient } from "@tanstack/react-query";
import { dismissAnnouncement, searchAnnouncements } from "api/announcements";
import { USER_AGENT } from "components/LoginSignUp/AuthenticationService";
import { ActivityIndicator, Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Alert, Linking } from "react-native";
import { WebView } from "react-native-webview";
import {
  useAuthenticatedQuery,
  useTranslation
} from "sharedHooks";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const onLinkPress = async target => {
    // Checking if the link is supported for links with custom URL scheme.
    const url = target.uri;
    const supported = await Linking.canOpenURL( url );

    if ( supported ) {
      await Linking.openURL( url );
    } else {
      Alert.alert( `Don't know how to open this URL: ${url}` );
    }
  };

  const headers = {};
  headers["user-agent"] = USER_AGENT;
  const options = { headers };
  console.log( "options :>> ", options );

  const apiParams = {
    locale: currentUser?.locale || "en",
    per_page: 20
  };
  // TODO: if there are more than 20 announcements, should we paginate and get more?
  const {
    data: announcements,
    refetch: refetchAnnouncements,
    isRefetching
  } = useAuthenticatedQuery(
    ["searchAnnouncements", apiParams],
    optsWithAuth => searchAnnouncements( apiParams, optsWithAuth ),
    {
      enabled: !!isOnline && !!currentUser
    }
  );

  const dismissAnnouncementMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => dismissAnnouncement( params, optsWithAuth ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries( ["searchAnnouncements"] );
        if ( refetchAnnouncements ) {
          refetchAnnouncements();
        }
      },
      onError: err => {
        // TODO: error handling / UI message?
        console.log( err, "err dismissing announcement" );
      }
    }
  );

  if ( !isOnline ) {
    return null;
  }
  if ( !currentUser ) {
    return null;
  }
  if ( !announcements || announcements.length === 0 ) {
    return null;
  }

  // Array of { id, body, dismissible }
  const homeAnnouncements = announcements
    // Sort by start date, oldest first
    .sort( ( a, b ) => new Date( a.start ) - new Date( b.start ) );
  const topAnnouncement = homeAnnouncements[0];
  console.log( "topAnnouncement :>> ", topAnnouncement );
  const { id, dismissible, body } = topAnnouncement;

  const dismiss = async () => {
    dismissAnnouncementMutation.mutate( { id } );
  };

  if ( isRefetching ) {
    return <ActivityIndicator size={32} />;
  }

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
