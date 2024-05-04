// @flow

import { ActivityIndicator } from "components/SharedComponents";
import * as React from "react";
import { FlatList, Text } from "react-native";

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
        size={25}
      />
    );
  }

  const renderMessages = ( { item } ) => (
    <Text>{item.subject}</Text>
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
