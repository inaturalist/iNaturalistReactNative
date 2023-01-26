/**
 * INatIcon icon set component.
 * Usage: <INatIcon name="icon-name" size={20} color="#4F8EF7" />
 */

import createIconSet from "react-native-vector-icons/lib/create-icon-set";

const glyphMap = {
  "tab-notifications": 57344,
  "icon-menu": 57345,
  "icon-createobservation": 57346,
  "compass-rose": 57347,
  "icon-noevidence": 57348,
  "icon-close": 57349,
  "icon-sound": 57350,
  "icon-camera": 57351,
  "ios-people-updated-2": 57352
};

const iconSet = createIconSet( glyphMap, "inaturalisticons", "inaturalisticons.ttf" );

export default iconSet;
export const {
  Button,
  getImageSource,
  getImageSourceSync
} = iconSet;
