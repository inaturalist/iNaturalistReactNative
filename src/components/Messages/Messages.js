// @flow

import searchMessages from "api/messages";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import MessageList from "./MessageList";

const Messages = ( ): Node => {
  const {
    data,
    isLoading
  } = useAuthenticatedQuery(
    ["searchMessages"],
    optsWithAuth => searchMessages( { page: 1 }, optsWithAuth )
  );
  // TODO: Reload when accessing again

  return (
    <ViewWithFooter>
      <MessageList
        loading={isLoading}
        messageList={data}
        testID="Messages.messages"
      />
    </ViewWithFooter>
  );
};

export default Messages;
