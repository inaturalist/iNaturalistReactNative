// @flow

import * as React from "react";
import { FlatList, Text, Pressable, ActivityIndicator, View } from "react-native";
import { textStyles, viewStyles } from "../../styles/messages/messages";
import { useNavigation } from "@react-navigation/native";

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

  const navigation = useNavigation( );

  if ( loading ) {
    return (
      <ActivityIndicator
        testID={"Messages.activityIndicator"}
      />
    );
  }

  const renderMessages = ( { item } ) => {

    //<Image source={{ uri: item.icon }} style={imageStyles.messageIcon} testID={`Project.${item.id}.photo`}/>

    const navToMessageDetails = ( ) => navigation.navigate( "MessageDetails", { item: item } );

    return (
      <Pressable
        onPress={navToMessageDetails}
        style={viewStyles.row}
        testID={`Message.${item.id}`}
      >
        <View>
          <Text style={textStyles.messageFrom}>{item.from_user.login}</Text>
          <Text style={textStyles.messageSubject}>{item.subject}</Text>
        </View>
    </Pressable>
    );
  };

  return (
    <FlatList
      data={messageList}
      renderItem={renderMessages}
      testID={testID}
    />
  );
};

export default MessageList;

