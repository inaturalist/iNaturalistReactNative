// @flow

import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { getBuildNumber, getVersion } from "react-native-device-info";

import ScrollViewWrapper from "./SharedComponents/ScrollViewWrapper";

const About = (): Node => {
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();

  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Body1>{`Version ${appVersion} (${buildVersion})`}</Body1>
      </View>
    </ScrollViewWrapper>
  );
};

export default About;
