// @flow

import searchMessages from "api/messages";
import { Body3, Tabs, ViewWrapper } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser.ts";

import MessageList from "./MessageList";

const NOTIFICATIONS_ID = "NOTIFICATIONS";
const MESSAGES_ID = "MESSAGES";

const Messages = (): Node => {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState( NOTIFICATIONS_ID );
  const { data, isLoading } = useAuthenticatedQuery(
    ["searchMessages"],
    optsWithAuth => searchMessages( { page: 1 }, optsWithAuth ),
    {
      enabled: !!currentUser
    }
  );

  const tabs = [
    {
      id: NOTIFICATIONS_ID,
      text: "Notifications",
      onPress: () => {
        setActiveTab( NOTIFICATIONS_ID );
      }
    },
    {
      id: MESSAGES_ID,
      text: "Messages",
      onPress: () => {
        setActiveTab( MESSAGES_ID );
      }
    }
  ];

  return (
    <ViewWrapper>
      {currentUser
        ? (
          <>
            <Tabs tabs={tabs} activeId={activeTab} />
            <MessageList
              loading={isLoading}
              messageList={data}
              testID="Messages.messages"
            />
          </>
        )
        : (
          <Body3 className="self-center">
            {t( "You-must-be-logged-in-to-view-messages" )}
          </Body3>
        )}
    </ViewWrapper>
  );
};

export default Messages;
