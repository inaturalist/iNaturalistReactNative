import ObscuredLocationIndicatorIcon from "images/svg/obscured_location_indicator.svg";
import React from "react";
import {
  Marker,
  Polygon,
} from "react-native-maps";
import colors from "styles/tailwindColors";

import { obscurationCellForLatLng } from "./helpers/mapHelpers";

interface Props {
  latitude: number;
  longitude: number;
}

const ObscuredLocationIndicator = ( {
  latitude,
  longitude,
}: Props ) => {
  const obscurationCell = obscurationCellForLatLng( latitude, longitude );
  return (
    <>
      <Polygon
        coordinates={[
          {
            latitude: obscurationCell.minLat,
            longitude: obscurationCell.minLng,
          },
          {
            latitude: obscurationCell.minLat,
            longitude: obscurationCell.maxLng,
          },
          {
            latitude: obscurationCell.maxLat,
            longitude: obscurationCell.maxLng,
          },
          {
            latitude: obscurationCell.maxLat,
            longitude: obscurationCell.minLng,
          },
        ]}
        strokeWidth={2}
        strokeColor={colors.inatGreen}
        fillColor="rgba( 116, 172, 0, 0.2 )"
      />
      <Marker
        coordinate={{ latitude, longitude }}
      >
        <ObscuredLocationIndicatorIcon
          testID="Map.ObscuredLocationIndicator"
          width={25}
          height={32}
        />
      </Marker>
    </>
  );
};

export default ObscuredLocationIndicator;
