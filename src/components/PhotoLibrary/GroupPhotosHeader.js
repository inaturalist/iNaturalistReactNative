// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import { textStyles, viewStyles } from "styles/photoLibrary/photoGalleryHeader";

type Props = {
  photos: number,
  observations: number
}

const GroupPhotosHeader = ( { photos, observations }: Props ): Node => {
  const navigation = useNavigation( );

  const navBack = ( ) => navigation.goBack( );

  return (
    <>
      <View style={viewStyles.header}>
        <HeaderBackButton onPress={navBack} />
        <Text style={textStyles.header}>{t( "Group-Photos" )}</Text>
      </View>
      <Text style={textStyles.header}>
        {t( "X-photos-X-observations", { photoCount: photos, observationCount: observations } )}
      </Text>
      <Text style={textStyles.text}>{t( "Combine-photos-onboarding" )}</Text>
    </>
  );
};

export default GroupPhotosHeader;
