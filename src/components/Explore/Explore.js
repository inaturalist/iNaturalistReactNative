// @flow

import {
  FloatingActionBar,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import MapView from "react-native-maps";
import { Appbar } from "react-native-paper";
import { useTranslation } from "sharedHooks";

type Props = {
  region: Object,
  mapView: any,
  updateRegion: Function,
  mapType: string,
  setMapReady: Function
};

const Explore = ( {
  region,
  mapView,
  updateRegion,
  mapType,
  setMapReady
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <ViewWrapper testID="Explore">
      <MapView
        className="h-full"
        showsCompass={false}
        region={region}
        ref={mapView}
        mapType={mapType}
        onRegionChangeComplete={async newRegion => {
          updateRegion( newRegion );
        }}
        onMapReady={setMapReady}
      />
      <FloatingActionBar
        position="bottomStart"
        containerClass="bottom-[100px] ml-1 rounded-md"
        endY={180}
        show
      >
        <View className="rounded-full overflow-hidden">
          <Appbar.Header>
            <Appbar.Action
              icon="combine"
              // onPress={combinePhotos}
              // disabled={noObsSelected || oneObsSelected}
              accessibilityLabel={t( "Combine-Photos" )}
            />
            <Appbar.Action
              icon="separate"
              // onPress={separatePhotos}
              // disabled={!obsWithMultiplePhotosSelected}
              accessibilityLabel={t( "Separate-Photos" )}
            />
            <Appbar.Action
              icon="trash-outline"
              // onPress={removePhotos}
              // disabled={noObsSelected}
              accessibilityLabel={t( "Remove-Photos" )}
            />
          </Appbar.Header>
        </View>
      </FloatingActionBar>
    </ViewWrapper>
  );
};

export default Explore;
