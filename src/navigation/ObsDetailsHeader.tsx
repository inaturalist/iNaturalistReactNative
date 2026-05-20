import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { View } from "components/styledComponents";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

const ObsDetailsHeader = ( { navigation, options }: NativeStackHeaderProps ) => {
  const insets = useSafeAreaInsets();
  const headerRight = typeof options.headerRight === "function"
    ? options.headerRight( {
      tintColor: colors.darkGray,
      canGoBack: navigation.canGoBack(),
    } )
    : options.headerRight;

  return (
    <View
      className="bg-white"
      style={{ paddingTop: insets.top }}
      testID="ObsDetails.header"
    >
      <View className="min-h-[48px] flex-row items-center justify-between px-1">
        <BackButton
          testID="header-back-button"
          inCustomHeader
          color={colors.darkGray}
          onPress={() => navigation.goBack()}
        />
        <View className="flex-row items-center">
          {headerRight}
        </View>
      </View>
    </View>
  );
};

export default ObsDetailsHeader;
