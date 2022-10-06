// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import colors from "../../styles/colors";
import { Pressable, Text, View } from "../styledComponents";

type Props = {
  showEditComment: boolean,
  onEditCommentPressed: ( event: any ) => void
}

const AddIDHeader = ( { showEditComment, onEditCommentPressed }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <View className="flex-row justify-between">
      <HeaderBackButton onPress={( ) => navigation.goBack( )} tintColor={colors.black} />
      <Text className="text-2xl self-center">{t( "Add-an-ID" )}</Text>
      {showEditComment
        ? (
          <Pressable
            onPress={onEditCommentPressed}
            accessibilityRole="link"
          >
            <IconMaterial name="textsms" size={25} />
          </Pressable>
        )
        : <View className="w-16" />}
    </View>
  );
};

export default AddIDHeader;
