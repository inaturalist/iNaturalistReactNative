import makeWebshell, {
  ForceElementSizeFeature,
  ForceResponsiveViewportFeature,
  HandleHTMLDimensionsFeature,
  HandleLinkPressFeature,
  useAutoheight,
} from "@formidable-webview/webshell";
import { useQueryClient } from "@tanstack/react-query";
import { dismissAnnouncement, searchAnnouncements } from "api/announcements";
import type { ApiAnnouncement } from "api/types";
import { ActivityIndicator, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { ComponentProps } from "react";
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
import type { QueryFunction } from "sharedHooks/useAuthenticatedQuery";
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

// using typing guidance here: https://formidable-webview.github.io/webshell/docs/autoheight/#robust-example
type WebshellProps = ComponentProps<typeof Webshell>;

const AutoheightWebView
= ( webshellProps: WebshellProps ) => {
  const { autoheightWebshellProps } = useAutoheight( {
    webshellProps,
  } );
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Webshell {...autoheightWebshellProps} />;
};

interface Props {
  isConnected: boolean;
}

interface AnnouncementQueryResponse {
  data?: ApiAnnouncement[];
  isRefetching: boolean;
  refetch: () => void;
}

const useAnnouncementsQuery = (
  queryKey: string[],
  queryFn: QueryFunction<ApiAnnouncement[]>,
  isAuthenticated: boolean,
): AnnouncementQueryResponse => {
  const dismissedAnnouncementIds
    = useStore( state => state.layout.dismissedAnnouncementIds );

  const queryFnWithoutDismissedIds = async () => {
    const announcements = await queryFn( { api_token: null } );
    return announcements
      .filter( ( { id } ) => !dismissedAnnouncementIds.includes( id ) );
  };
  const unauthenticatedQuery = useQuery(
    // include dismissedIds because they inform the query response
    [...queryKey, dismissedAnnouncementIds],
    queryFnWithoutDismissedIds,
    { enabled: !isAuthenticated },
  // TS TODO: our custom uQ doesn't yet handle generic response type
  ) as AnnouncementQueryResponse;

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

  const apiParams = {
    // TS TODO: this realm type is treated inconsistently as a query result & model type
    // local _is_ on the model but we need to figure this out
    locale: currentUser?.locale || "en",
    per_page: 20,
  };

  // TODO: if there are more than 20 announcements, should we paginate and get more?
  const isAuthenticated = !!currentUser;
  const {
    data: announcements,
    isRefetching,
    refetch: refetchAnnouncements,
  } = useAnnouncementsQuery(
    // TS TODO: RQ handles this and our wrappers should reflect that
    ["searchAnnouncements", apiParams],
    optsWithAuth => searchAnnouncements( apiParams, optsWithAuth ),
    isAuthenticated,
  );

  const invalidateAnnouncementsQueries
    = () => queryClient.invalidateQueries( { queryKey: ["searchAnnouncements"] } );

  const dismissLoggedOutAnnouncement
    = useStore( state => state.layout.dismissLoggedOutAnnouncement );

  const { mutate: dismissAnnouncementMutate }
  = useAuthenticatedMutation(
    // TS TODO: uAM doesn't yet know how to type mutations
    ( params, optsWithAuth ) => dismissAnnouncement( params, optsWithAuth ),
    {
      onSuccess: () => {
        invalidateAnnouncementsQueries();
        refetchAnnouncements();
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

  const homeAnnouncements = announcements
    // Sort by start date, oldest first
    .sort( ( a, b ) => new Date( a.start ).getTime() - new Date( b.start ).getTime() );
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
      // TS TODO: uAM doesn't yet know how to type mutations
      dismissAnnouncementMutate( { id } );
    } else {
      dismissLoggedOutAnnouncement( id );
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
        onDOMLinkPress={target => openExternalWebBrowser( target.uri )}
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
