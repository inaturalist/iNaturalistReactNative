/**
 * INatIcon icon set component.
 * Usage: <INatIcon name="icon-name" size={20} color="#4F8EF7" />
 */

import createIconSet from "react-native-vector-icons/lib/create-icon-set";

const glyphMap = {
  "notifications-bell": 57344,
  "hamburger-menu": 57345,
  "plus-sign": 57346,
  "compass-rose": 57347,
  "pen-and-paper": 57348,
  microphone: 57350,
  camera: 57355,
  "triple-dots": 57352,
  "close-button-x": 57351,
  "comments-filled-in": 57353,
  checkmark: 57354,
  pencil: 57356,
  "ios-people-updated-2": 57357,
  cv: 57358,
  "close-button-circle": 57349,
  "flash-on-circle": 57360,
  "copyright-circle": 57361,
  "crop-photo-circle": 57362,
  "trash-can": 57364,
  "status-saved": 57363,
  "upload-arrow": 57359,
  "icn-id2": 57365,
  "identification-solid": 57366,
  flag: 57367,
  photos: 57368
};

const iconSet = createIconSet( glyphMap, "inaturalisticons", "inaturalisticons.ttf" );

export default iconSet;
export const {
  Button,
  getImageSource,
  getImageSourceSync
} = iconSet;

export {
  glyphMap
};
