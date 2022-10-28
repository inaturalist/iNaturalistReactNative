// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import colors from "../../../tailwind-colors";

type Props = {
  photos: number,
  observations: number
}

const GroupPhotosHeader = ( { photos, observations }: Props ): Node => {
  const navigation = useNavigation( );

  const navBack = ( ) => navigation.goBack( );

  return (
    <View className="h-32">
      <View className="flex-row">
        <HeaderBackButton onPress={navBack} tintColor={colors.black} />
        <Text className="text-xl mt-3">{t( "Group-Photos" )}</Text>
      </View>
      <Text className="text-lg ml-10">
        {t( "X-photos-X-observations", { photoCount: photos, observationCount: observations } )}
      </Text>
      <Text className="mx-3 mt-5">{t( "Combine-photos-onboarding" )}</Text>
    </View>
  );
};

export default GroupPhotosHeader;
