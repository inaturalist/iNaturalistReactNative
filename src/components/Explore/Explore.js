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
import ObservationsView from "./ObservationsView";
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
          isFetchingNextPage={isFetchingNextPage}
          observations={observations}
          onEndReached={onEndReached}
        />
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
