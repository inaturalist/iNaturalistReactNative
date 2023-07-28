// @flow

import {
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
}

const Explore = ( {
  isFetchingNextPage,
  observations,
  onEndReached
}: Props ): Node => {
  // const { t } = useTranslation( );
  const [view, setView] = useState( "list" );

  return (
    <ViewWrapper testID="Explore">
      <Header />
      {/* <MapView
        className="h-full"
        showsCompass={false}
        region={region}
        ref={mapView}
        mapType={mapType}
        onRegionChangeComplete={async newRegion => {
          updateRegion( newRegion );
        }}
        onMapReady={setMapReady}
      /> */}
      {console.log( observations, "obs in explore" )}
      {observations.length > 0 && (
        <View className="h-full mt-[180px]">
          <ObservationsFlashList
            isFetchingNextPage={isFetchingNextPage}
            layout={view}
            data={observations}
            onEndReached={onEndReached}
            testID="ExploreAnimatedList"
          />
        </View>
      )}
      <ViewBar
        view={view}
        updateView={newView => setView( newView )}
      />
    </ViewWrapper>
  );
};

export default Explore;
