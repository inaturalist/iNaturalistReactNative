// @flow

import searchMessages from "api/messages";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { Text } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

import MessageList from "./MessageList";

const Messages = ( ): Node => {
  const currentUser = useCurrentUser( );
  const {
    data,
    isLoading
  } = useAuthenticatedQuery(
    ["searchMessages"],
    optsWithAuth => searchMessages( { page: 1 }, optsWithAuth ),
    {
      enabled: !!currentUser
    }
  );

  return (
    <ViewWithFooter>
      {currentUser ? (
        <MessageList
          loading={isLoading}
          messageList={data}
          testID="Messages.messages"
        />
      ) : (
        <Text className="self-center">
          {t( "You-must-be-logged-in-to-view-messages" )}
        </Text>
      )}
    </ViewWithFooter>
  );
};

export default Messages;
