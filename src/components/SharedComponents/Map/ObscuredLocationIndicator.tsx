import type { Node } from "react";
import React from "react";
import {
  Polygon
} from "react-native-maps";
import colors from "styles/tailwindColors";

interface Props {
  obscurationCell: Object,
  showLocationIndicator?: boolean
}

const ObscuredLocationIndicator = ( {
  obscurationCell,
  showLocationIndicator
}: Props ): Node => showLocationIndicator && (
  <Polygon
    coordinates={[
      {
        latitude: obscurationCell.minLat,
        longitude: obscurationCell.minLng
      },
      {
        latitude: obscurationCell.minLat,
        longitude: obscurationCell.maxLng
      },
      {
        latitude: obscurationCell.maxLat,
        longitude: obscurationCell.maxLng
      },
      {
        latitude: obscurationCell.maxLat,
        longitude: obscurationCell.minLng
      }
    ]}
    strokeWidth={2}
    strokeColor={colors.inatGreen}
    fillColor="rgba( 116, 172, 0, 0.2 )"
  />

);

export default ObscuredLocationIndicator;
