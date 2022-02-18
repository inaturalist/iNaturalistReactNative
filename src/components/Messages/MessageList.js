// @flow

import * as React from "react";
import { FlatList, Text } from "react-native";
import { textStyles } from "../../styles/messages/messages";

type Props = {
  messageList: Array<Object>
}

const MessageList = ( {
  messageList
}: Props ): React.Node => {

  const renderMessages = ( { item } ) => {
    return (
        <Text style={textStyles.projectName}>{item.subject}</Text>
    );
  };

  return (
    <FlatList
      data={messageList}
      renderItem={renderMessages}
      testID="Message.list"
    />
  );
};

export default MessageList;

