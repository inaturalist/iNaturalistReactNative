// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";

import { ExploreContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";

import BottomCard from "./BottomCard";

const Explore = ( ): Node => {
  const {
    exploreList,
    loadingExplore,
    exploreFilters
  } = useContext( ExploreContext );
  const taxonId = exploreFilters ? exploreFilters.taxon_id : null;

  console.log( exploreList, "explore list" );

  return (
    <ViewWithFooter>
      {taxonId !== null && (
        <ObservationViews
          loading={loadingExplore}
          observationList={exploreList}
          taxonId={taxonId}
          testID="Explore.observations"
        />
      )}
      <BottomCard />
    </ViewWithFooter>
  );
};

export default Explore;
