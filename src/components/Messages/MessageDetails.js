// @flow

import React from "react";
import { Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { textStyles, viewStyles } from "../../styles/messages/messageDetails";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

const MessageDetails = ( ): React.Node => {

  const { params } = useRoute( );
  const { item } = params;

  console.log( "message details" );
  console.log( item );

  return (
    <ViewWithFooter>
      <View style={viewStyles.main}>
        <Text style={textStyles.messageFrom}>{item.from_user.login}</Text>
        <Text style={textStyles.messageSubject}>{item.subject}</Text>
        <Text style={textStyles.messageBody}>{item.body}</Text>
      </View>
    </ViewWithFooter>
  );
};

export default MessageDetails;

