import { useRoute } from "@react-navigation/native";
import { View } from "components/styledComponents";
import {
  ExploreProvider,
} from "providers/ExploreContext";
import React from "react";

const ExploreSearchContainerWithContext = () => {
  const { params } = useRoute( );
  console.log( "params", params );

  return (
    <View />
  );
};

const ExploreSearchContainer = () => (
  <ExploreProvider>
    <ExploreSearchContainerWithContext />
  </ExploreProvider>
);

export default ExploreSearchContainer;
