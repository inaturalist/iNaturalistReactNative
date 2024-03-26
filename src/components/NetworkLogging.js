// @flow

import type { Node } from "react";
import React from "react";
import NetworkLogger from "react-native-network-logger";

import ViewWrapper from "./SharedComponents/ViewWrapper";

// TODO: remove this from production build
const NetworkLogging = (): Node => (
  <ViewWrapper>
    <NetworkLogger />
  </ViewWrapper>
);

export default NetworkLogging;
