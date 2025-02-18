import {
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import React, { useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { useCurrentUser, useLayoutPrefs, useTranslation } from "sharedHooks";

import NotificationsContainer from "./NotificationsContainer";
import NotificationsTab, {
  NOTIFICATIONS_REFRESHED,
  OTHER_TAB,
  OWNER_TAB
} from "./NotificationsTab";

const Notifications = ( ) => {
  const [activeTab, setActiveTab] = useState<typeof OWNER_TAB | typeof OTHER_TAB>( OWNER_TAB );
  const { t } = useTranslation();
  const { isDefaultMode } = useLayoutPrefs( );
  const currentUser = useCurrentUser( );

  return (
    <ViewWrapper>
      <Tabs
        tabs={[
          {
            id: OWNER_TAB,
            text: t( "MY-CONTENT--notifications" ),
            onPress: () => setActiveTab( OWNER_TAB )
          },
          {
            id: OTHER_TAB,
            text: t( "FOLLOWING--notifications" ),
            onPress: () => setActiveTab( OTHER_TAB )
          }
        ]}
        activeId={activeTab}
        TabComponent={NotificationsTab}
      />
      {activeTab === OWNER_TAB && (
        <NotificationsContainer
          currentUser={currentUser}
          notificationParams={{ observations_by: "owner" }}
          onRefresh={( ) => EventRegister.emit( NOTIFICATIONS_REFRESHED, OWNER_TAB )}
        />
      )}
      {activeTab === OTHER_TAB && (
        <NotificationsContainer
          currentUser={currentUser}
          notificationParams={{ observations_by: "following" }}
          onRefresh={( ) => EventRegister.emit( NOTIFICATIONS_REFRESHED, OTHER_TAB )}
        />
      )}
    </ViewWrapper>
  );
};

export default Notifications;
