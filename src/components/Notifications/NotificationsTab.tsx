import { fetchUnviewedObservationUpdatesCount } from "api/observations";
import type { ApiOpts } from "api/types";
import type { TabComponentProps } from "components/SharedComponents/Tabs/Tabs";
import Heading5 from "components/SharedComponents/Typography/Heading5.tsx";
import { View } from "components/styledComponents";
import React from "react";
import {
  useAuthenticatedQuery,
  useCurrentUser
} from "sharedHooks";
import useStore from "stores/useStore";

export const OWNER_TAB = "owner";
export const OTHER_TAB = "other";

const NotificationsTab = ( { id, text }: TabComponentProps ) => {
  const observationMarkedAsViewedAt = useStore( state => state.observationMarkedAsViewedAt );
  const currentUser = useCurrentUser( );
  const { data: numUnviewed } = useAuthenticatedQuery(
    [
      "NotificationsTab",
      "notificationsCount",
      // We want to check for notifications when the user views an
      // observation, because that might make the indicator go away
      observationMarkedAsViewedAt,
      id
    ],
    ( optsWithAuth: ApiOpts ) => fetchUnviewedObservationUpdatesCount(
      {
        observations_by: id === OWNER_TAB
          ? "owner"
          : "following"
      },
      optsWithAuth
    ),
    {
      enabled: !!( currentUser )
    }
  );

  return (
    <View className="flex-row px-3 pt-4 pb-3 justify-center items-center">
      <Heading5
        maxFontSizeMultiplier={1.5}
        numberOfLines={1}
      >
        { text }
      </Heading5>
      { Number( numUnviewed ) > 0 && (
        <View className="h-[6px] w-[6px] ml-1 rounded-full bg-inatGreen" />
      ) }
    </View>
  );
};

export default NotificationsTab;
