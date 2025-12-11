import { createIconSet } from "@react-native-vector-icons/common";

import glyphmap from "./glyphmap.json";

export type INatIconNames = keyof typeof glyphmap;

const iconSet = createIconSet( glyphmap, "INatIcon", "INatIcon.ttf" );

export default iconSet;
export const {
  Button,
  getImageSource,
  getImageSourceSync
} = iconSet;
