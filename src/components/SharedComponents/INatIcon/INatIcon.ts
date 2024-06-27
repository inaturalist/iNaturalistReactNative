import { createIconSet } from "react-native-vector-icons";

import glyphmap from "./glyphmap.json";

const iconSet = createIconSet( glyphmap, "INatIcon", "INatIcon.ttf" );

export default iconSet;
export const {
  Button,
  getImageSource,
  getImageSourceSync
} = iconSet;
