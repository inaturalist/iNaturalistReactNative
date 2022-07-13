// @flow

import type { Node } from "react";
import React from "react";
import { getBuildNumber, getVersion } from "react-native-device-info";

import PlaceholderText from "./PlaceholderText";
import ViewWithFooter from "./SharedComponents/ViewWithFooter";

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
