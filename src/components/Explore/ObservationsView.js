// @flow

import {
  Map,
  ObservationsFlashList
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";

import ObservationsViewBar from "./ObservationsViewBar";

type Props = {
  isFetchingNextPage?: boolean,
  observations: Array<Object>,
  onEndReached: Function,
  region: Object
}

const ObservationsView = ( {
  isFetchingNextPage,
  observations,
  onEndReached,
  region
}: Props ): Node => {
  const [observationsView, setObservationsView] = useState( "map" );

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
            onEndReached={onEndReached}
            testID="ExploreObservationsAnimatedList"
          />
        )}
      </View>
      <ObservationsViewBar
        observationsView={observationsView}
        updateObservationsView={newView => setObservationsView( newView )}
      />
    </>
  );
};

export default ObservationsView;
