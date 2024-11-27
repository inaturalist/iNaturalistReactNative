import {
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";

import NotificationsContainer from "./NotificationsContainer";
import NotificationsTab, { OTHER_TAB, OWNER_TAB } from "./NotificationsTab";

const Notifications = ( ) => {
  const [activeTab, setActiveTab] = useState<typeof OWNER_TAB | typeof OTHER_TAB>( OWNER_TAB );
  const { t } = useTranslation();

  return (
    <ViewWrapper>
      <Tabs
        tabs={[
          {
            id: OWNER_TAB,
            text: t( "MY-OBSERVATIONS--notifications" ),
            onPress: () => setActiveTab( OWNER_TAB )
          },
          {
            id: OTHER_TAB,
            text: t( "OTHER-OBSERVATIONS--notifications" ),
            onPress: () => setActiveTab( OTHER_TAB )
          }
        ]}
        activeId={activeTab}
        TabComponent={NotificationsTab}
      />
      {activeTab === OWNER_TAB && (
        <NotificationsContainer notificationParams={{ observations_by: "owner" }} />
      )}
      {activeTab === OTHER_TAB && (
        <NotificationsContainer notificationParams={{ observations_by: "following" }} />
      )}
    </ViewWrapper>
  );
};

export default Notifications;
