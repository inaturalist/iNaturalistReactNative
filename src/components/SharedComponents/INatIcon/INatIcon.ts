import { createIconSet } from "@react-native-vector-icons/common";

import glyphmap from "./glyphmap.json";

const iconSet = createIconSet( glyphmap, "INatIcon", "INatIcon.ttf" );

export default iconSet;
export const {
  Button,
  getImageSource,
  getImageSourceSync
} = iconSet;
