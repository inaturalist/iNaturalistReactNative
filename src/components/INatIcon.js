/**
 * INatIcon icon set component.
 * Usage: <INatIcon name="icon-name" size={20} color="#4F8EF7" />
 */

import createIconSet from "react-native-vector-icons/lib/create-icon-set";

const glyphMap = {
  "arrow-down": 57344,
  "arrow-left": 57345,
  "arrow-right": 57346,
  "arrow-up": 57347,
  "button-closecamera": 57348,
  "button-copyright": 57349,
  "button-crop": 57350,
  "close-button-x": 57351,
  collapse: 57352,
  "compass-rose": 57354,
  expand: 57356,
  flashon: 57357,
  focus: 57358,
  "icn-captive": 57360,
  "icn-dna": 57361,
  "icn-id2": 57362,
  "icn-id-help": 57363,
  "icn-layers": 57364,
  "icn-leading-id": 57365,
  "icn-location-none": 57366,
  "icn-location-obscured": 57367,
  "icn-location-private": 57369,
  "icn-logomark-new-bird": 57370,
  "icn-photo-grid": 57371,
  "icn-photo-quilt": 57372,
  "icn-species": 57373,
  "icn-taxa-amphibians": 57375,
  "icn-taxa-animals": 57376,
  "icn-taxa-arachnid": 57377,
  "icn-taxa-birds": 57378,
  "icn-taxa-fish": 57379,
  "icn-taxa-fungi": 57380,
  "icn-taxa-insects": 57381,
  "icn-taxa-kelp": 57382,
  "icn-taxa-mammals": 57383,
  "icn-taxa-mollusks": 57384,
  "icn-taxa-plants": 57385,
  "icn-taxa-protozoa": 57386,
  "icn-taxa-reptiles": 57387,
  "icn-taxa-something": 57388,
  "icn-wild": 57389,
  "icon-annotation-obsfields": 57390,
  "icon-atlas": 57391,
  "icon-camera-2": 57392,
  "icon-check-1": 57393,
  "icon-cid-coarser": 57394,
  "icon-cid-finer": 57395,
  "icon-comment": 57396,
  "comments-filled-in": 57397,
  "plus-sign": 57398,
  "icon-delete": 57399,
  "icon-dqaqualitygrade-fail": 57400,
  "icon-dqaqualitygrade-pass": 57401,
  "icon-fave": 57402,
  "triple-dots": 57404,
  "icon-list": 57405,
  "icon-noevidence": 57407,
  "icon-projectchanges": 57408,
  "icon-sound": 57409,
  "icon-taxonchanges": 57410,
  "identification-solid": 57411,
  "inat-wordmark": 57412,
  "ios-calendar-outline": 57413,
  "ios-people-updated-2": 57414,
  statussaved: 57416,
  "notifications-bell": 57417,
  treeview: 57418,
  pencil: 57420,
  "hamburger-menu": 57353,
  "icon-flag": 57403,
  "id-agree": 57359,
  upload: 57368,
  computervision: 57355,
  "flag-fill": 57374
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
