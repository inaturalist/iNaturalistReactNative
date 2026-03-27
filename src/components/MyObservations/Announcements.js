// @flow

import makeWebshell, {
  ForceElementSizeFeature,
  ForceResponsiveViewportFeature,
  HandleHTMLDimensionsFeature,
  HandleLinkPressFeature,
  useAutoheight,
} from "@formidable-webview/webshell";
import { useQueryClient } from "@tanstack/react-query";
import { dismissAnnouncement, searchAnnouncements } from "api/announcements";
import { ActivityIndicator, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { WebView } from "react-native-webview";
import { openExternalWebBrowser } from "sharedHelpers/util";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useGridLayout,
  useTranslation,
} from "sharedHooks";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import colors from "styles/tailwindColors";

const TARGET_SPACING = 10;

const Webshell = makeWebshell(
  WebView,
  new HandleLinkPressFeature( { preventDefault: true } ),
  new HandleHTMLDimensionsFeature(),
  new ForceResponsiveViewportFeature( { maxScale: 1 } ),
  new ForceElementSizeFeature( {
    target: "body",
    heightValue: "auto",
    widthValue: "auto",
  } ),
);

const AutoheightWebView = ( webshellProps ): Node => {
  const { autoheightWebshellProps } = useAutoheight( {
    webshellProps,
  } );
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Webshell {...autoheightWebshellProps} />;
};

type Props = {
  isConnected: boolean,
  layout: "list" | "grid"
}

const Announcements = ( {
  isConnected,
  layout,
}: Props ): Node => {
  const { t } = useTranslation( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const { flashListStyle } = useGridLayout( layout );
  const flashListHorizontalPadding = flashListStyle.paddingLeft || 0;
  const flashListTopPadding = flashListStyle.paddingTop || 0;
  const outerHorizontalSpacing = layout === "grid"
    ? TARGET_SPACING - flashListHorizontalPadding
    : 10;
  const outerTopSpacing = layout === "grid"
    ? TARGET_SPACING - flashListTopPadding
    : 10;
  const outerBottomSpacing = layout === "grid"
    ? TARGET_SPACING - flashListTopPadding
    : 0;

  const onLinkPress = async target => openExternalWebBrowser( target.uri );
  const announcementContainerStyle = {
    marginHorizontal: outerHorizontalSpacing,
    marginTop: outerTopSpacing,
    marginBottom: outerBottomSpacing,
  };

  const apiParams = {
    locale: currentUser?.locale || "en",
    per_page: 20,
  };
  // TODO: if there are more than 20 announcements, should we paginate and get more?
  const {
    data: announcements,
    refetch: refetchAnnouncements,
    isRefetching,
  } = useAuthenticatedQuery(
    ["searchAnnouncements", apiParams],
    optsWithAuth => searchAnnouncements( apiParams, optsWithAuth ),
    {
      enabled: !!( currentUser ),
    },
  );

  const { mutate: dismissAnnouncementMutate } = useAuthenticatedMutation(
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
      },
    },
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
  const announcementHtml = `
  <html>
    <body style="margin: 0; padding: 0;">
      ${body}
    </body>
  </html>
`;

  const dismiss = async () => {
    dismissAnnouncementMutate( { id } );
  };

  if ( isRefetching ) {
    return <ActivityIndicator size={32} />;
  }

  return (
    <View
      className="bg-white"
      style={announcementContainerStyle}
      testID="announcements-container"
    >
      <AutoheightWebView
        onDOMLinkPress={onLinkPress}
        originWhitelist={["*"]}
        source={{ html: announcementHtml }}
        scrollEnabled={false}
        testID="announcements-webview"
      />
      {dismissible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t( "Dismiss-announcement" )}
          className="absolute top-[-10px] right-[-10px] h-[44px] w-[44px] items-center
          justify-center z-10"
          onPress={dismiss}
          testID="announcements-dismiss"
        >
          <View
            className="h-[24px] w-[24px] items-center justify-center rounded-full bg-darkGray/50"
          >
            <INatIcon
              name="close"
              color={colors.white}
              size={11}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default Announcements;
