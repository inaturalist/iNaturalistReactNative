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
import { ActivityIndicator, Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { WebView } from "react-native-webview";
import { openExternalWebBrowser } from "sharedHelpers/util";
import {
  useAuthenticatedQuery,
  useCurrentUser,
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
  isConnected: boolean
}

const Announcements = ( {
  isConnected
}: Props ): Node => {
  const { t } = useTranslation( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );

  const onLinkPress = async target => openExternalWebBrowser( target.uri );

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
      enabled: !!( currentUser )
    }
  );

  const dismissAnnouncementMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => dismissAnnouncement( params, optsWithAuth ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries( { queryKey: ["searchAnnouncements"] } );
        if ( refetchAnnouncements ) {
          refetchAnnouncements();
        }
      },
      onError: err => {
        throw err;
      }
    }
  );

  if ( !isConnected ) {
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
      {dismissible && (
        <Button
          className="m-3"
          text={t( "DISMISS" )}
          onPress={dismiss}
          testID="announcements-dismiss"
        />
      )}
    </View>
  );
};

export default Announcements;
