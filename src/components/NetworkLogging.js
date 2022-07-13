// @flow

import type { Node } from "react";
import React from "react";
import NetworkLogger from "react-native-network-logger";

import ViewWithFooter from "./SharedComponents/ViewWithFooter";

// TODO: remove this from production build
const NetworkLogging = ( ): Node => (
  <ViewWithFooter>
    <NetworkLogger />
  </ViewWithFooter>
);

export default NetworkLogging;
