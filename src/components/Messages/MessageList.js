// @flow

import * as React from "react";
import { ActivityIndicator, FlatList } from "react-native";

import MessagePreview from "./MessagePreview";

type Props = {
  loading: boolean,
  messageList: Array<Object>,
  testID: string
}

const MessageList = ( {
  loading,
  messageList,
  testID
}: Props ): React.Node => {
  if ( loading ) {
    return (
      <ActivityIndicator
        testID="Messages.activityIndicator"
      />
    );
  }

  const renderMessages = ( { item } ) => (
    <MessagePreview message={item} />
  );

  return (
    <FlatList
      data={messageList}
      renderItem={renderMessages}
      testID={testID}
    />
  );
};

export default MessageList;
