import { fetchUnviewedObservationUpdatesCount } from "api/observations";
import type { ApiOpts } from "api/types";
import { Heading4 } from "components/SharedComponents";
import type { TabComponentProps } from "components/SharedComponents/Tabs/Tabs";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";
import { EventRegister } from "react-native-event-listeners";
import {
  useAuthenticatedQuery,
  useCurrentUser,
} from "sharedHooks";
import useStore from "stores/useStore";

export const OWNER_TAB = "owner";
export const OTHER_TAB = "other";
export const NOTIFICATIONS_REFRESHED = "notifications-refreshed";

const NotificationsTab = ( { id, text }: TabComponentProps ) => {
  const observationMarkedAsViewedAt = useStore( state => state.observationMarkedAsViewedAt );
  const currentUser = useCurrentUser( );

  const { data: numUnviewed, refetch } = useAuthenticatedQuery(
    [
      "NotificationsTab",
      "notificationsCount",
      // We want to check for notifications when the user views an
      // observation, because that might make the indicator go away
      observationMarkedAsViewedAt,
      id,
    ],
    ( optsWithAuth: ApiOpts ) => fetchUnviewedObservationUpdatesCount(
      {
        observations_by: id === OWNER_TAB
          ? "owner"
          : "following",
      },
      optsWithAuth,
    ),
    {
      enabled: !!( currentUser ),
    },
  );

  useEffect( ( ) => {
    const listener = EventRegister.addEventListener(
      NOTIFICATIONS_REFRESHED,
      ( tabId: string ) => {
        if ( tabId === id ) {
          refetch( );
        }
      },
    );
    return ( ) => {
      EventRegister?.removeEventListener( listener as string );
    };
  }, [id, refetch] );

  return (
    <View className="flex-row px-3 pt-4 pb-3 justify-center items-center">
      <Heading4
        maxFontSizeMultiplier={1.5}
        numberOfLines={1}
      >
        { text }
      </Heading4>
      { Number( numUnviewed ) > 0 && (
        <View className="h-[6px] w-[6px] ml-1 rounded-full bg-inatGreen" />
      ) }
    </View>
  );
};

export default NotificationsTab;
