// @flow

import Button from "components/SharedComponents/Buttons/Button";
import {
  fontMonoClass, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Share } from "react-native";
import { getBuildNumber, getSystemName, getVersion } from "react-native-device-info";
import RNFS from "react-native-fs";
import Mailer from "react-native-mail";

import { logFilePath } from "../../react-native-logs.config";
import ScrollWithFooter from "./SharedComponents/ScrollWithFooter";

const TextHeader = ( { level, children } ) => {
  let sizeClass = "text-2xl";
  if ( level === 2 ) sizeClass = "text-xl";
  if ( level === 3 ) sizeClass = "text-lg";
  return <Text className={`${sizeClass} mt-1 mb-2`}>{ children }</Text>;
};

const AboutScreen = ( ): Node => {
  const appVersion = getVersion( );
  const buildVersion = getBuildNumber( );
  const device = getSystemName( );
  const [logContents, setLogContents] = useState( "" );

  const emailParams = {
    subject: `iNat RN ${device} Logs (version ${appVersion} - ${buildVersion})`,
    recipients: ["help+mobile@inaturalist.org"]
  };

  const setAttachment = ( ) => ( {
    path: logFilePath,
    mimeType: "txt"
  } );

  const shareLogFile = ( ) => Share.share( {
    title: emailParams.subject,
    url: logFilePath
  }, emailParams );

  const openEmailWithLogsAttached = ( ) => {
    Mailer.mail( {
      ...emailParams,
      isHTML: true,
      attachments: [setAttachment( )]
    }, ( error, event ) => {
      if ( Platform.OS === "ios" && error === "not_available" ) {
        Alert.alert(
          t( "Looks-like-youre-not-using-Apple-Mail" ),
          t( "You-can-still-share-the-file", { email: emailParams.recipients[0] } ),
          [
            {
              text: t( "Cancel" ),
              style: "cancel"
            },
            {
              text: t( "Share" ),
              onPress: shareLogFile
            }
          ]
        );
        return;
      }
      Alert.alert(
        error,
        event
      );
    } );
  };

  const { mtime: logFileMtime } = RNFS.stat( logFilePath );

  useEffect( ( ) => {
    async function fetchLogContents( ) {
      const contents = await RNFS.readFile( logFilePath );
      setLogContents( contents.split( "\n" ).slice( -100 ).join( "\n" ) );
    }
    fetchLogContents( );
  }, [logFileMtime] );

  /* eslint-disable i18next/no-literal-string */
  return (
    <ScrollWithFooter>
      <View className="p-4">
        <Text>
          This is an app under development! Right now this page just shows
          some details for developers.
        </Text>
        <TextHeader>Version</TextHeader>
        <Text selectable>{`${appVersion} (${buildVersion})`}</Text>
        <TextHeader>Logs</TextHeader>
        <Text>Last 100 lines</Text>
        <Text className={`text-xs h-fit mb-5 ${fontMonoClass}`}>{logContents}</Text>
        <Button
          level="focus"
          onPress={openEmailWithLogsAttached}
          text={t( "EMAIL-DEBUG-LOGS" )}
          className="mb-5"
        />
        { Platform.OS === "ios" && (
          <Button
            onPress={shareLogFile}
            text={t( "SHARE-DEBUG-LOGS" )}
          />
        ) }
        <TextHeader>Paths</TextHeader>
        <TextHeader level={2}>Documents</TextHeader>
        <Text selectable className={fontMonoClass}>{ RNFS.DocumentDirectoryPath }</Text>
        <TextHeader level={2}>Caches</TextHeader>
        <Text selectable className={fontMonoClass}>{ RNFS.CachesDirectoryPath }</Text>
      </View>
    </ScrollWithFooter>
  );
};

export default AboutScreen;
