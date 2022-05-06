// @flow

import React from "react";
import {
  Text
} from "react-native";
import { getVersion, getBuildNumber } from "react-native-device-info";

import type { Node } from "react";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

const AboutScreen = ( ): Node => {
  const appVersion = getVersion( );
  const buildVersion = getBuildNumber( );

  return (
    <ViewWithFooter>
      <Text>
        app version:
        {` ${appVersion} (${buildVersion})`}
      </Text>
    </ViewWithFooter>
  );
};

export default AboutScreen;
