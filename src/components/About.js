// @flow

import { Button } from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import useLogs from "sharedHooks/useLogs";

import ScrollViewWrapper from "./SharedComponents/ScrollViewWrapper";

const About = (): Node => {
  const { shareLogFile, emailLogFile } = useLogs( );

  /* eslint-disable i18next/no-literal-string */
  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Text>
          This is an app under development! Right now this page just shows some
          details for developers.
        </Text>
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
