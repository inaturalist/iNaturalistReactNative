// @flow

import React from "react";
import type { Node } from "react";
import { useTranslation } from "react-i18next";
import { Headline } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Pressable, View } from "react-native";
import { HeaderBackButton } from "@react-navigation/elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { viewStyles } from "../../styles/obsDetails/addID";

type Props = {
  showEditComment: boolean,
  onEditCommentPressed: ( event: any ) => void
}

const AddIDHeader = ( { showEditComment, onEditCommentPressed }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <View style={viewStyles.headerRow}>
      <HeaderBackButton onPress={( ) => navigation.goBack( )} />
      <Headline>{t( "Add-ID-Header" )}</Headline>
      {showEditComment
        ? (
          <Pressable
            onPress={onEditCommentPressed}
            accessibilityRole="link"
          >
            <Icon name="chat-processing-outline" size={25} />
          </Pressable>
        )
        : <View />}
    </View>
  );
};

export default AddIDHeader;
