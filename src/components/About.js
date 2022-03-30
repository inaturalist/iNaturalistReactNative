// @flow

import React from "react";
import {
  Text
} from "react-native";
import { getVersion, getBuildNumber } from "react-native-device-info";

import type { Node } from "react";

const AboutScreen = ( ): Node => {
  const appVersion = getVersion( );
  const buildVersion = getBuildNumber( );

  return (
    <Text>
      app version:
      {` ${appVersion} (${buildVersion})`}
    </Text>
  );
};

export default AboutScreen;
