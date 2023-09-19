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
    observations, isFetchingNextPage, fetchNextPage, status
  } = useInfiniteObservationsScroll( { upsert: false, params: exploreParams } );

  return observationsView === "map"
    ? (
      <Map
        className="h-full"
        showsCompass={false}
        region={region}
        taxonId={exploreParams.taxon_id}
        hideMap={region.latitude === 0.0}
      />
    )
    : (
      <View className="h-full mt-[180px]">
        <ObservationsFlashList
          isFetchingNextPage={isFetchingNextPage}
          layout={observationsView}
          data={observations}
          onEndReached={fetchNextPage}
          testID="ExploreObservationsAnimatedList"
          handleScroll={handleScroll}
          status={status}
        />
      </View>
    );
};

export default ObservationsView;
