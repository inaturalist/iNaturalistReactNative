// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import MessageList from "./MessageList";
import useMessages from "./hooks/useMessages";

const Messages = ( ): Node => {
  const userLogin = { user_login: "nickm01" };
  // TODO: apiParams not needed
  const [apiParams, setApiParams] = React.useState( userLogin );

  const messages = useMessages( apiParams );

  return (
    <ViewWithFooter>
      <MessageList
        messageList={messages}
        testID="Messages.messages"
      />
    </ViewWithFooter>
  );
};

export default Messages;
