// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { textStyles, viewStyles } from "../../styles/photoLibrary/photoGalleryHeader";
import TranslatedText from "../SharedComponents/TranslatedText";

type Props = {
  photos: number,
  observations: number
}

const GroupPhotosHeader = ( { photos, observations }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const navBack = ( ) => navigation.goBack( );

  return (
    <>
      <View style={viewStyles.header}>
        <HeaderBackButton onPress={navBack} />
        <TranslatedText style={textStyles.header} text="Group-Photos" />
      </View>
      <Text style={textStyles.header}>
        {t( "X-photos-X-observations", { photoCount: photos, observationCount: observations } )}
      </Text>
      <TranslatedText style={textStyles.text} text="Combine-photos-onboarding" />
    </>
  );
};

export default GroupPhotosHeader;
