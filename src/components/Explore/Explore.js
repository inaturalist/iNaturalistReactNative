// @flow

import {
  BottomSheet,
  Button,
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";

import Header from "./Header";
import IdentifiersView from "./IdentifiersView";
import ObservationsView from "./ObservationsView";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

type Props = {
  isFetchingNextPage?: boolean,
  observations: Array<Object>,
  onEndReached: Function,
  region: Object,
  exploreView: string,
  changeExploreView: Function
}

const Explore = ( {
  isFetchingNextPage,
  observations,
  onEndReached,
  region,
  exploreView,
  changeExploreView
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const [headerRight, setHeaderRight] = useState( null );

  const exploreViewText = {
    observations: t( "OBSERVATIONS" ),
    species: t( "SPECIES" ),
    observers: t( "OBSERVERS" ),
    identifiers: t( "IDENTIFIERS" )
  };

  return (
    <ViewWrapper testID="Explore">
      <Header
        region={region}
        setShowExploreBottomSheet={setShowExploreBottomSheet}
        exploreViewButtonText={exploreViewText[exploreView]}
        headerRight={headerRight}
      />
      {exploreView === "observations" && (
        <ObservationsView
          region={region}
          isFetchingNextPage={isFetchingNextPage}
          observations={observations}
          onEndReached={onEndReached}
        />
      )}
      {exploreView === "species" && (
        <SpeciesView
          testID="ExploreSpeciesAnimatedList"
          setHeaderRight={setHeaderRight}
        />
      )}
      {exploreView === "observers" && (
        <ObserversView testID="ExploreObserversAnimatedList" setHeaderRight={setHeaderRight} />
      )}
      {exploreView === "identifiers" && (
        <IdentifiersView testID="ExploreIdentifiersAnimatedList" setHeaderRight={setHeaderRight} />
      )}
      {showExploreBottomSheet && (
        <BottomSheet
          headerText={t( "EXPLORE" )}
        >
          {Object.keys( exploreViewText ).map( view => (
            <Button
              text={exploreViewText[view]}
              key={exploreViewText[view]}
              className="mx-5 my-3"
              onPress={( ) => {
                changeExploreView( view );
                setShowExploreBottomSheet( false );
              }}
            />
          ) )}
        </BottomSheet>
      )}
    </ViewWrapper>
  );
};

export default Explore;
