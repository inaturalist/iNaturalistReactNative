// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { MessageContext } from "../../providers/contexts";
import MessageList from "./MessageList";

const Messages = ( ): Node => {
  const { messageList, loading } = useContext( MessageContext );

  return (
    <ViewWithFooter>
      <MessageList
        loading={loading}
        messageList={messageList}
        testID="Messages.messages" //Q
      />
    </ViewWithFooter>
  );
};

export default Messages;
