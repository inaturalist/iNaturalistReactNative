// @flow

import {
  Map,
  ObservationsFlashList,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";

// import MapView from "react-native-maps";
import Header from "./Header";
import ViewBar from "./ViewBar";

type Props = {
  isFetchingNextPage?: boolean,
  observations: Array<Object>,
  onEndReached: Function,
  region: Object
}

const Explore = ( {
  isFetchingNextPage,
  observations,
  onEndReached,
  region
}: Props ): Node => {
  // const { t } = useTranslation( );
  const [view, setView] = useState( "map" );

  return (
    <ViewWrapper testID="Explore">
      <Header region={region} />
      {view === "map" && (
        <Map
          className="h-full"
          showsCompass={false}
          region={region}
          taxonId={3}
        />
      )}
      <View className="h-full mt-[180px]">
        {( observations.length > 0 && view !== "map" ) && (
          <ObservationsFlashList
            isFetchingNextPage={isFetchingNextPage}
            layout={view}
            data={observations}
            onEndReached={onEndReached}
            testID="ExploreAnimatedList"
          />
        )}
      </View>
      <ViewBar
        view={view}
        updateView={newView => setView( newView )}
      />
    </ViewWrapper>
  );
};

export default Explore;
