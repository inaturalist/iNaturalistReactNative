// @flow

import { Button } from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";

import ScrollViewWrapper from "./SharedComponents/ScrollViewWrapper";

const About = (): Node => {

  /* eslint-disable i18next/no-literal-string */
  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Text>
          This is an app under development! Right now this page just shows some
          details for developers.
        </Text>
      </View>
    </ScrollViewWrapper>
  );
};

export default About;
