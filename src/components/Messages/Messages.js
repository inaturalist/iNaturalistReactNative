// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import MessageList from "./MessageList";
import useMessages from "./hooks/useMessages";

const Messages = ( ): Node => {
  const messages = useMessages();

  return (
    <ViewWithFooter>
      <MessageList
//TODO        loading={loading}
        messageList={messages}
        testID="Messages.messages" //Q
      />
    </ViewWithFooter>
  );
};

export default Messages;
