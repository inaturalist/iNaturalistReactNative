// @flow

import * as React from "react";
// TODO import { FlatList, Pressable, Text, Image } from "react-native";
import { FlatList, Text } from "react-native";
// TODO import { useNavigation } from "@react-navigation/native";

// TODO import { imageStyles, viewStyles, textStyles } from "../../styles/projects/projects"; 
import { textStyles } from "../../styles/projects/projects";  // TODO need to style

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
  // TODO const navigation = useNavigation( );

  const renderMessages = ( { item } ) => {
    // TODO const navToProjectDetails = ( ) => navigation.navigate( "ProjectDetails", { id: item.id } );
    return (
      // TODO <Pressable
      //   onPress={navToProjectDetails}
      //   style={viewStyles.row}
      //   testID={`Project.${item.id}`}
      // >
        <Text style={textStyles.projectName}>{item.subject}</Text>
      // TODO </Pressable>
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

