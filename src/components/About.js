// @flow

import { Button } from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import Config from "react-native-config";
import {
  getBuildNumber,
  getVersion
} from "react-native-device-info";
import useLogs from "sharedHooks/useLogs";

import ScrollViewWrapper from "./SharedComponents/ScrollViewWrapper";

const modelFileName: string = Platform.select( {
  ios: Config.IOS_MODEL_FILE_NAME,
  android: Config.ANDROID_MODEL_FILE_NAME
} );
const taxonomyFileName = Platform.select( {
  ios: Config.IOS_TAXONOMY_FILE_NAME,
  android: Config.ANDROID_TAXONOMY_FILE_NAME
} );

type TextHeaderProps = {
  level?: number,
  children: any
};

const TextHeader = ( { level, children }: TextHeaderProps ) => {
  let sizeClass = "text-2xl";
  if ( level === 2 ) sizeClass = "text-xl";
  if ( level === 3 ) sizeClass = "text-lg";
  return <Text className={`${sizeClass} mt-1 mb-2`}>{children}</Text>;
};

const About = (): Node => {
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();
  const { shareLogFile, emailLogFile } = useLogs( );

  /* eslint-disable i18next/no-literal-string */
  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Text>
          This is an app under development! Right now this page just shows some
          details for developers.
        </Text>
        <TextHeader>Version</TextHeader>
        <Text selectable>{`${appVersion} (${buildVersion})`}</Text>
        <TextHeader>Computer Vision</TextHeader>
        <View className="flex-row">
          <Text className="font-bold">Model: </Text>
          <Text selectable>{modelFileName}</Text>
        </View>
        <View className="flex-row mb-5">
          <Text className="font-bold">Taxonomy: </Text>
          <Text selectable>{taxonomyFileName}</Text>
        </View>
        <Button
          level="focus"
          onPress={emailLogFile}
          text={t( "EMAIL-DEBUG-LOGS" )}
          className="mb-5"
        />
        {Platform.OS === "ios" && (
          <Button onPress={shareLogFile} text={t( "SHARE-DEBUG-LOGS" )} />
        )}
      </View>
    </ScrollViewWrapper>
  );
};

export default About;
