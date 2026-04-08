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
import React from "react";
import { WebView } from "react-native-webview";
import { openExternalWebBrowser } from "sharedHelpers/util";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useQuery,
  useTranslation,
} from "sharedHooks";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

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

const AutoheightWebView = webshellProps => {
  const { autoheightWebshellProps } = useAutoheight( {
    webshellProps,
  } );
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Webshell {...autoheightWebshellProps} />;
};

interface Props {
  isConnected: boolean;
}

const useAnnouncementsQuery = ( queryKey, queryFn, isAuthenticated ) => {
  const dismissedAnnouncementIds
    = useStore( state => state.dismissedAnnouncementIds );

  const queryFnWithoutDismissedIds = async () => {
    // $FlowFixMe[incompatible-call]
    const announcements = await queryFn();
    return announcements
      .filter( ( { id } ) => !dismissedAnnouncementIds.includes( id ) );
  };
  const unauthenticatedQuery = useQuery(
    queryKey,
    queryFnWithoutDismissedIds,
    { enabled: !isAuthenticated },
  );

  const authenticatedQuery = useAuthenticatedQuery(
    queryKey,
    queryFn,
    { enabled: isAuthenticated },
  );

  return isAuthenticated
    ? authenticatedQuery
    : unauthenticatedQuery;
};

const Announcements = ( {
  isConnected,
}: Props ) => {
  const { t } = useTranslation( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );

  const onLinkPress = async target => openExternalWebBrowser( target.uri );

  const apiParams = {
    locale: currentUser?.locale || "en",
    per_page: 20,
  };

  // TODO: if there are more than 20 announcements, should we paginate and get more?
  const isAuthenticated = !!currentUser;
  const {
    data: announcements,
    isRefetching,
  } = useAnnouncementsQuery(
    ["searchAnnouncements", apiParams],
    optsWithAuth => searchAnnouncements( apiParams, optsWithAuth ),
    isAuthenticated,
  );

  const invalidateAnnouncementsQueries
    = () => queryClient.invalidateQueries( { queryKey: ["searchAnnouncements"] } );

  const dismissLoggedOutAnnouncement
    = useStore( state => state.dismissLoggedOutAnnouncement );

  const { mutate: dismissAnnouncementMutate } = useAuthenticatedMutation(
    ( params, optsWithAuth ) => dismissAnnouncement( params, optsWithAuth ),
    {
      onSuccess: () => {
        invalidateAnnouncementsQueries();
      },
      onError: err => {
        throw err;
      },
    },
  );

  if ( !isConnected ) {
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
    if ( isAuthenticated ) {
      dismissAnnouncementMutate( { id } );
    } else {
      dismissLoggedOutAnnouncement( id );
      invalidateAnnouncementsQueries();
    }
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
        source={{ html: announcementHtml }}
        scrollEnabled={false}
        testID="announcements-webview"
      />
      {dismissible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t( "Dismiss-announcement" )}
          className="absolute top-0 right-0 h-[44px] w-[44px] items-center
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
