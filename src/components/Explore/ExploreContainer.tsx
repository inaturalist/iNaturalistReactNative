import { useRoute } from "@react-navigation/native";
import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import type { TabStackScreenProps } from "navigation/types";
import { ExploreProvider, initialStateFromEntryParams } from "providers/ExploreContext";
import React from "react";

const ExploreContainer = ( ) => {
  const { name, params } = useRoute<TabStackScreenProps<"Explore" | "RootExplore">["route"]>( );

  return (
    <ExploreProvider initialState={initialStateFromEntryParams( params )}>
      <ExploreStackNavigator showBackButton={name !== "RootExplore"} />
    </ExploreProvider>
  );
};

export default ExploreContainer;
