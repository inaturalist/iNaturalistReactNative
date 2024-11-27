import {
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import Heading5 from "components/SharedComponents/Typography/Heading5.tsx";
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
            text: t( "MY-OBSERVATIONS" ),
            onPress: () => setActiveTab( OWNER )
          },
          {
            id: OTHER,
            text: t( "OTHER-OBSERVATIONS" ),
            onPress: () => setActiveTab( OTHER )
          }
        ]}
        activeId={activeTab}
        TextComponent={Heading5}
      />
      {activeTab === OWNER && (
        <NotificationsContainer notificationParams={{ observations_by: "owner" }} />
      )}
      {activeTab === OTHER && (
        <NotificationsContainer notificationParams={{ observations_by: "following" }} />
      )}
    </ViewWrapper>
  );
};

export default Notifications;
