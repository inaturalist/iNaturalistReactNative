// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Headline } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { viewStyles } from "styles/obsDetails/addID";

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
            <IconMaterial name="textsms" size={25} />
          </Pressable>
        )
        : <View />}
    </View>
  );
};

export default AddIDHeader;
