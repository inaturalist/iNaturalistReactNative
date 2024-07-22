import ViewWrapper from "components/SharedComponents/ViewWrapper";
import React from "react";
import NetworkLogger from "react-native-network-logger";

const NetworkLogging = () => {
  // eslint-disable-next-line no-undef
  if ( !__DEV__ ) {
    return null;
  }
  return (
    <ViewWrapper>
      <NetworkLogger />
    </ViewWrapper>
  );
};

export default NetworkLogging;
