// @flow

import {
  ObservationsFlashList
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  isFetchingNextPage?: boolean,
  observations: Array<Object>,
  onEndReached: Function
}

const SpeciesView = ( {
  isFetchingNextPage,
  observations,
  onEndReached
}: Props ): Node => (
  <View className="h-full mt-[180px]">
    <ObservationsFlashList
      isFetchingNextPage={isFetchingNextPage}
      layout="grid"
      data={observations}
      onEndReached={onEndReached}
      testID="ExploreSpeciesAnimatedList"
      hideUploadStatus
      showSpeciesSeen
    />
  </View>
);

export default SpeciesView;
