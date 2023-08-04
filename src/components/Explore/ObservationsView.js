// @flow

import {
  Map,
  ObservationsFlashList
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useInfiniteObservationsScroll } from "sharedHooks";

type Props = {
  exploreParams: Object,
  region: Object,
  handleScroll: Function,
  observationsView: string
}

const ObservationsView = ( {
  exploreParams,
  region,
  handleScroll,
  observationsView
}: Props ): Node => {
  const {
    observations, isFetchingNextPage, fetchNextPage
  } = useInfiniteObservationsScroll( { upsert: false, params: exploreParams } );

  return (
    <>
      {observationsView === "map" && (
        <Map
          className="h-full"
          showsCompass={false}
          region={region}
          taxonId={3}
        />
      )}
      <View className="h-full mt-[180px]">
        {( observations.length > 0 && observationsView !== "map" ) && (
          <ObservationsFlashList
            isFetchingNextPage={isFetchingNextPage}
            layout={observationsView}
            data={observations}
            onEndReached={fetchNextPage}
            testID="ExploreObservationsAnimatedList"
            handleScroll={handleScroll}
          />
        )}
      </View>
    </>
  );
};

export default ObservationsView;
