// @flow

import Button from "components/SharedComponents/Buttons/Button";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Alert } from "react-native";
import { getBuildNumber, getSystemName, getVersion } from "react-native-device-info";
import Mailer from "react-native-mail";

import { logFilePath } from "../../react-native-logs.config";
import PlaceholderText from "./PlaceholderText";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

const AboutScreen = ( ): Node => {
  const appVersion = getVersion( );
  const buildVersion = getBuildNumber( );
  const device = getSystemName( );

  const emailParams = {
    subject: `iNat RN ${device} Logs (version ${appVersion} - ${buildVersion})`,
    recipients: ["help+mobile@inaturalist.org"]
  };

  const setAttachment = ( ) => ( {
    path: logFilePath,
    mimeType: "txt"
  } );

  const openEmailWithLogsAttached = ( ) => {
    Mailer.mail( {
      ...emailParams,
      isHTML: true,
      attachments: [setAttachment( )]
    }, ( error, event ) => {
      Alert.alert(
        error,
        event
      );
    } );
  };

  return (
    <ViewWithFooter>
      <PlaceholderText text={`app version: ${appVersion} (${buildVersion})`} />
      <View className="mt-16 mx-5">
        <Button
          level="primary"
          onPress={openEmailWithLogsAttached}
          text={t( "EMAIL-DEBUG-LOGS" )}
        />
      </View>
    </ViewWithFooter>
  );
};

export default AboutScreen;
