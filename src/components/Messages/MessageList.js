// @flow

import { ActivityIndicator } from "components/SharedComponents";
import * as React from "react";
import { FlatList, Text } from "react-native";
import { textStyles } from "styles/messages/messages";

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
    <Text style={textStyles.projectName}>{item.subject}</Text>
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
