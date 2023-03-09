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
  "close-button-circle": 57348,
  "copyright-circle": 57349,
  "crop-photo-circle": 57350,
  "close-button-x": 57351,
  collapse: 57352,
  "compass-rose": 57354,
  expand: 57356,
  "flash-on": 57357,
  focus: 57358,
  "icn-captive": 57360,
  "icn-dna": 57361,
  identification: 57362,
  "icn-id-help": 57363,
  "icn-layers": 57364,
  "icn-leading-id": 57365,
  "icn-location-none": 57366,
  "icn-location-obscured": 57367,
  "icn-location-private": 57369,
  logomark: 57370,
  "photo-grid": 57371,
  "photo-quilt": 57372,
  "species-unknown": 57373,
  "iconic-amphibia": 57375,
  "iconic-animalia": 57376,
  "iconic-arachnida": 57377,
  "iconic-aves": 57378,
  "iconic-actinopterygii": 57379,
  "iconic-fungi": 57380,
  "iconic-insecta": 57381,
  "iconic-chromista": 57382,
  "iconic-mammalia": 57383,
  "iconic-mollusca": 57384,
  "iconic-plantae": 57385,
  "iconic-protozoa": 57386,
  "iconic-reptilia": 57387,
  "iconic-unknown": 57388,
  "icn-wild": 57389,
  camera: 57392,
  checkmark: 57393,
  chatbubble: 57396,
  comments: 57397,
  plus: 57398,
  trash: 57399,
  "star-outline": 57402,
  "triple-dots": 57404,
  "pen-and-paper": 57407,
  microphone: 57409,
  "identification-solid": 57411,
  "inat-wordmark": 57412,
  "ios-calendar-outline": 57413,
  people: 57414,
  "notifications-bell": 57417,
  treeview: 57418,
  pencil: 57420,
  "hamburger-menu": 57353,
  "flag-outline": 57403,
  "id-agree": 57359,
  "arrow-up-plain": 57368,
  "sparkly-label": 57355,
  flag: 57374,
  gallery: 57415,
  taxarank: 57390
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
