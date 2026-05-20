import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { View } from "components/styledComponents";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

/*
  WIP: This "solution" to an e2e test fail should probably not be required.
  Once we clear all blockers listed here: https://linear.app/inaturalist/issue/MOB-1435/obsdetails-does-not-show-screen-header-in-some-circumstances
  we should re-assess if this is required. Currently, I believe that "fixing"
  safe area insets on an app-level will make this specific fail go away.
*/
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
