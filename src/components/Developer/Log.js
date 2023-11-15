import { useNavigation } from "@react-navigation/native";
import {
  INatIconButton,
  ScrollViewWrapper
} from "components/SharedComponents";
import { fontMonoClass, Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect
} from "react";
import { Platform } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useLogs from "sharedHooks/useLogs";

/* eslint-disable i18next/no-literal-string */
const Log = (): Node => {
  const navigation = useNavigation( );
  const { emailLogFile, shareLogFile, logContents } = useLogs( );
  const headerRight = useCallback( ( ) => (
    <>
      { Platform.OS === "ios" && (
        <View className="mr-3">
          <INatIconButton
            icon="share"
            onPress={shareLogFile}
            accessibilityLabel="Email logs"
            accessibilityHint="Opens email app"
          />
        </View>
      ) }
      <IconMaterial
        name="mail"
        size={24}
        onPress={emailLogFile}
        accessibilityLabel="Email logs"
        accessibilityHint="Opens email app"
      />
    </>
  ), [emailLogFile, shareLogFile] );
  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation]
  );

  return (
    <ScrollViewWrapper>
      <View className="p-5">
        <Text className={`text-xs h-fit mb-5 ${fontMonoClass}`}>
          {logContents}
        </Text>
      </View>
    </ScrollViewWrapper>
  );
};

export default Log;
