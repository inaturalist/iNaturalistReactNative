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
  gallery: 57368,
  "arrow-down": 57369,
  "arrow-left": 57370,
  "arrow-right": 57371,
  "arrow-up": 57372,
  collapse: 57373,
  "combined-shape": 57374,
  expand: 57375,
  "icn-logomark-new-bird": 57376,
  "icn-location-private": 57377,
  "icn-location-obscured": 57378,
  "icn-location-none": 57379,
  "icn-leading-id": 57380,
  "icn-layers": 57381,
  "icn-id-help": 57382,
  "icn-dna": 57383,
  "icn-captive": 57384,
  focus: 57385,
  "icn-photo-grid": 57386,
  "icn-photo-quilt": 57387,
  "icn-species": 57388,
  "icn-taxa-amphibians": 57389,
  "icn-taxa-animals": 57390,
  "icn-taxa-arachnid": 57391,
  "icn-taxa-birds": 57392,
  "icn-taxa-fish": 57393,
  "icn-taxa-fungi": 57394,
  "icn-taxa-insects": 57395,
  "icn-taxa-kelp": 57396,
  "icn-taxa-mammals": 57397,
  "icn-taxa-mollusks": 57398,
  "icon-comment": 57399,
  "icon-cid-finer": 57400,
  "icon-cid-coarser": 57401,
  "icon-atlas": 57402,
  "icon-annotation-obsfields": 57403,
  "icn-wild": 57404,
  "icn-taxa-something": 57405,
  "icn-taxa-reptiles": 57406,
  "icn-taxa-protozoa": 57407,
  "icn-taxa-plants": 57408,
  "icon-dqaqualitygrade-fail": 57409,
  "icon-dqaqualitygrade-pass": 57410,
  "icon-fave": 57411,
  "icon-flag": 57412,
  "icon-list": 57413,
  "icon-projectchanges": 57414,
  treeview: 57416,
  "ios-calendar-outline": 57417,
  "inat-wordmark": 57418,
  "icon-taxonchanges": 57419
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
