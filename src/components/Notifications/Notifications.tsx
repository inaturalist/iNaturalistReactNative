import {
  ScrollViewWrapper,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

import NotificationsContainer from "./NotificationsContainer";

const OWNER = "owner";
const OTHER = "other";

const Notifications = ( ) => {
  const [activeTab, setActiveTab] = useState<typeof OWNER | typeof OTHER>( OWNER );
  const { t } = useTranslation();

  return (
    <ViewWrapper>
      <Tabs
        tabs={[
          {
            id: OWNER,
            text: t( "MY-CONTENT--notifications" ),
            onPress: () => setActiveTab( OWNER )
          },
          {
            id: OTHER,
            text: t( "FOLLOWING--notifications" ),
            onPress: () => setActiveTab( OTHER )
          }
        ]}
        activeId={activeTab}
      />
      <ScrollViewWrapper>
        {activeTab === OWNER && (
          <NotificationsContainer notificationParams={{ observations_by: "owner" }} />
        )}
        {activeTab === OTHER && (
          <NotificationsContainer notificationParams={{ observations_by: "following" }} />
        )}
      </ScrollViewWrapper>
    </ViewWrapper>
  );
};

export default Notifications;
