import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import { ExploreV2Provider } from "providers/ExploreV2Context";
import React from "react";

const ExploreV2Container = ( ) => (
  <ExploreV2Provider>
    <ExploreStackNavigator />
  </ExploreV2Provider>
);

export default ExploreV2Container;
