// @flow

import React from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import MessageList from "./MessageList";
import useMessages from "./hooks/useMessages";

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
