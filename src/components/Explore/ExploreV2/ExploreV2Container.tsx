import { useRoute } from "@react-navigation/native";
import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import type { TabStackScreenProps } from "navigation/types";
import { ExploreV2Provider, initialStateFromEntryParams } from "providers/ExploreV2Context";
import React from "react";

const ExploreV2Container = ( ) => {
  const { params } = useRoute<TabStackScreenProps<"Explore" | "RootExplore">["route"]>( );

  return (
    <ExploreV2Provider initialState={initialStateFromEntryParams( params )}>
      <ExploreStackNavigator />
    </ExploreV2Provider>
  );
};

export default ExploreV2Container;
