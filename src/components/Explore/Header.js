// @flow

import {
  Body3, Body4,
  Button,
  INatIcon, INatIconButton, ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Surface, useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const Header = ( ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  const surfaceStyle = {
    backgroundColor: theme.colors.onPrimary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  };

  const displayCommonName = ( ) => "Birds";
  const displayScientificName = ( ) => "Aves";

  return (
    <Surface
      style={surfaceStyle}
      className="h-[230px] top-0 absolute w-full"
      elevation={5}
    >
      <View className="top-[65px] mx-5">
        <View className="flex-row justify-between pb-5 align-center">
          <Button
            text={t( "OBSERVATIONS" )}
            className="shrink"
            dropdown
          />
          <View className="bg-darkGray rounded-full h-[46px] w-[46px]">
            <INatIconButton
              icon="label"
              color={colors.white}
              className="self-center"
            />
          </View>
        </View>
        <View className="flex-row mb-4">
          <INatIcon name="label-outline" size={15} />
          <View>
            <Body3
              className="text-darkGray ml-[8px]"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayCommonName( )}
            </Body3>
            <Body4
              className="text-darkGray ml-[8px]"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayScientificName( )}
            </Body4>
          </View>
        </View>
        <ObservationLocation
          observation={{
            latitude: 30.18183,
            longitude: -85.760449
          }}
        />
        <View className="absolute right-0 bg-darkGray rounded-full" />
        <View className="absolute right-0 top-20 bg-darkGray rounded-md">
          <INatIconButton
            icon="sliders"
            color={colors.white}
          />
        </View>
      </View>
    </Surface>
  );
};

export default Header;
