// @flow

import {
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useState } from "react";

// import MapView from "react-native-maps";
import Header from "./Header";
import ViewBar from "./ViewBar";

const Explore = ( ): Node => {
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
      <ViewBar
        view={view}
        updateView={newView => setView( newView )}
      />
    </ViewWrapper>
  );
};

export default Explore;
