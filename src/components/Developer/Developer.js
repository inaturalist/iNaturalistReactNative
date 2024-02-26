import { useNavigation } from "@react-navigation/native";
import {
  Button,
  Heading1,
  Heading2,
  ScrollViewWrapper
} from "components/SharedComponents";
import { fontMonoClass, Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import Config from "react-native-config";
import {
  getBuildNumber,
  getVersion
} from "react-native-device-info";
import RNFS from "react-native-fs";
import useLogs from "sharedHooks/useLogs";

const H1 = ( { children } ) => <Heading1 className="mt-3 mb-2">{children}</Heading1>;
const H2 = ( { children } ) => <Heading2 className="mt-3 mb-2">{children}</Heading2>;
const P = ( { children } ) => <Text selectable className="mb-2">{children}</Text>;
const CODE = ( { children } ) => <Text selectable className={fontMonoClass}>{children}</Text>;

const modelFileName: string = Platform.select( {
  ios: Config.IOS_MODEL_FILE_NAME,
  android: Config.ANDROID_MODEL_FILE_NAME
} );
const taxonomyFileName = Platform.select( {
  ios: Config.IOS_TAXONOMY_FILE_NAME,
  android: Config.ANDROID_TAXONOMY_FILE_NAME
} );

/* eslint-disable i18next/no-literal-string */
const Developer = (): Node => {
  const navigation = useNavigation( );
  const appVersion = getVersion( );
  const buildVersion = getBuildNumber( );
  const { shareLogFile, emailLogFile } = useLogs();
  return (
    <ScrollViewWrapper>
      <View className="p-5">
        <Button
          onPress={() => navigation.navigate( "UILibrary" )}
          text="UI Library"
          className="mb-5"
        />
        <Button
          onPress={() => navigation.navigate( "network" )}
          text="Network"
          className="mb-5"
        />
        <Button
          onPress={() => navigation.navigate( "log" )}
          text="Log"
          className="mb-5"
        />
        <Button
          onPress={() => navigation.navigate( "Identify" )}
          text="Identify"
          className="mb-5"
        />
        <H1>Version</H1>
        <P>{`${appVersion} (${buildVersion})`}</P>
        <H1>Computer Vision</H1>
        <View className="flex-row">
          <Text className="font-bold">Model: </Text>
          <Text selectable>{modelFileName}</Text>
        </View>
        <View className="flex-row mb-5">
          <Text className="font-bold">Taxonomy: </Text>
          <Text selectable>{taxonomyFileName}</Text>
        </View>
        <H1>Paths</H1>
        <H2>Documents</H2>
        <P>
          <CODE>{RNFS.DocumentDirectoryPath}</CODE>
        </P>
        <H2>Caches</H2>
        <P>
          <CODE>{RNFS.CachesDirectoryPath}</CODE>
        </P>
        <H1>Log file contents</H1>
        <Button
          level="focus"
          onPress={emailLogFile}
          text={t( "EMAIL-DEBUG-LOGS" )}
          className="mb-5"
        />
        <Button
          onPress={shareLogFile}
          text={t( "SHARE-DEBUG-LOGS" )}
          className="mb-5"
        />
      </View>
    </ScrollViewWrapper>
  );
};

export default Developer;
