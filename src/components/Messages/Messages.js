// @flow

import type { Node } from "react";
import React from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useMessages from "./hooks/useMessages";
import MessageList from "./MessageList";

const Messages = ( ): Node => {
  // TODO: Reload when accessing again
  const { messages, loading } = useMessages( );

  return (
    <ViewWithFooter>
      <MessageList
        loading={loading}
        messageList={messages}
        testID="Messages.messages"
      />
    </ViewWithFooter>
  );
};

export default Messages;
