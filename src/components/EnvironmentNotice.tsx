/* eslint-disable i18next/no-literal-string */
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getEnvironmentOverride } from "sharedHelpers/installData";

const EnvironmentNotice = ( ) => {
  const insets = useSafeAreaInsets( );
  const environmentOverride = useMemo( () => getEnvironmentOverride(), [] );

  if ( !environmentOverride ) {
    return null;
  }

  return (
    <View
      className="absolute top-0 left-0 right-0 bg-inatGreen z-50 items-center justify-end"
      style={{ height: insets.top + 4 }}
      pointerEvents="none"
    >
      <Text className="text-[14px] py-[0px] text-white">
        environment:
        {" "}
        {environmentOverride}
      </Text>
    </View>
  );
};

export default EnvironmentNotice;
