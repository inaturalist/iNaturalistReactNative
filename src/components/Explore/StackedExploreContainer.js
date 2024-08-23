// Explore when accessed within a navigation stack, e.g. from TaxonDetails

import { ExploreProvider } from "providers/ExploreContext.tsx";
import React from "react";
import useStore from "stores/useStore";

import ExploreContainer from "./ExploreContainer";
import useParams from "./hooks/useParams";

const StackedExploreContainer = ( ) => {
  const exploreView = useStore( state => state.exploreView );
  const setExploreView = useStore( state => state.setExploreView );
  const setStoredParams = useStore( state => state.setStoredParams );
  useParams( );
  return (
    <ExploreContainer
      exploreView={exploreView}
      setExploreView={setExploreView}
      setStoredParams={setStoredParams}
    />
  );
};

const WithContext = () => (
  <ExploreProvider>
    <StackedExploreContainer />
  </ExploreProvider>
);

export default WithContext;
