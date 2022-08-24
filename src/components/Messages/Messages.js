// @flow

import type { Node } from "react";
import React from "react";

import searchMessages from "../../api/messages";
import useQuery from "../../sharedHooks/useAuthenticatedQuery";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import MessageList from "./MessageList";

const Messages = ( ): Node => {
  const {
    data: messages,
    isLoading
  } = useQuery( "searchMessages", searchMessages );
  // TODO: Reload when accessing again

  return (
    <ViewWithFooter>
      <MessageList
        loading={isLoading}
        messageList={messages}
        testID="Messages.messages"
      />
    </ViewWithFooter>
  );
};

export default Messages;
