// @flow

import React from "react";
import { getVersion, getBuildNumber } from "react-native-device-info";

import type { Node } from "react";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";
import PlaceholderText from "./PlaceholderText";

const AboutScreen = ( ): Node => {
  const appVersion = getVersion( );
  const buildVersion = getBuildNumber( );

  return (
    <ViewWithFooter>
      <PlaceholderText text={`app version: ${appVersion} (${buildVersion})`} />
    </ViewWithFooter>
  );
};

export default AboutScreen;
