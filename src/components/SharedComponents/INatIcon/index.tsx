import React from "react";
import {
  useColorScheme,
} from "react-native";
import colors from "styles/tailwindColors";

import type { INatIconName } from "./INatIcon";
import Icon from "./INatIcon";

interface Props {
  testID?: string;
  name: string;
  color?: string;
  size?: number;
  dropShadow?: boolean;
  isDarkModeEnabled?: boolean;
}

type Aliases = Record<string, string>;

// Most of these are names for these icons used in design mapped to more
// consistent and deduped filenames. We might also put aliases of convenience
// here, e.g. "speech" and "chat" might both map to "comments" if we find
// ourselves forgetting the name "comments"
const aliasMap = {
  addevidence: "plus",
  "evidence-add": "plus-bold",
  addid: "id-agree",
  back: "chevron-left",
  captive: "pot" as INatIconName, // Casting because "pot" does not exist in the glyphmap.
  checkmark: "check",
  "close-large": "close",
  "close-small": "close-bold",
  combine: "photos",
  multiplephotos: "photos",
  "multiplephotos-small": "photos-outline",
  "comment-fill": "comments",
  "comment-outline": "comments-outline",
  copyrightcc: "copyright",
  currentlocation: "location-crosshairs",
  cv: "sparkly-label",
  date: "clock-outline",
  delete: "trash-outline",
  "downvote-active": "arrow-down-bold-circle",
  "downvote-inactive": "arrow-down-bold-circle-outline",
  notes: "pencil-outline",
  edit: "pencil",
  "evidence-close": "close-bold",
  fail: "triangle-exclamation",
  "fave-active": "star",
  "fave-inactive": "star-bold-outline",
  filters: "sliders",
  flipcamera: "flip",
  geoprivacy: "globe" as INatIconName, // Casting because "globe" does not exist in the glyphmap.
  gridview: "grid-square",
  listview: "list-square",
  list: "list",
  "id-large-fill": "label",
  "id-small-outline": "label-outline",
  journalposts: "book",
  location: "map-marker-outline",
  maplayers: "layers",
  multiplesounds: "sounds",
  notifications: "notifications-bell",
  observations: "binoculars",
  pass: "checkmark-circle",
  recordsound: "microphone",
  remark: "add-comment-outline",
  reset: "rotate-right",
  search: "magnifying-glass",
  separate: "grid",
  "sound-pause": "pause-circle",
  "sound-play": "play-circle",
  "sound-record": "microphone-circle",
  "sound-small": "sound-bold-outline",
  sound: "sound-outline",
  species: "leaf",
  sync: "rotate",
  "sync-unsynced": "rotate-exclamation",
  taxarankarrow: "info-circle-outline",
  "upload-arrow": "arrow-up",
  "upload-complete": "check",
  "upload-saved": "arrow-up-circle-dots",
  "upvote-active": "arrow-up-bold-circle",
  "upvote-inactive": "arrow-up-bold-circle-outline",
} as const;

type INatIconAlias = keyof typeof aliasMap;
type INatIconNameOrAlias = INatIconName | INatIconAlias;
const typedAliasMap: Record<INatIconAlias, INatIconName> = aliasMap;

function isAlias( name: string ): name is INatIconAlias {
  return name in typedAliasMap;
}

type Props = {
  testID?: string;
  name: INatIconNameOrAlias;
  color?: string;
  size?: number;
  dropShadow?: boolean;
  isDarkModeEnabled?: boolean;
};

// Use default color if none is specified
const INatIcon = ( {
  testID, name, color, size, dropShadow, isDarkModeEnabled = false,
}: Props ) => {
  const colorScheme = useColorScheme( );

  const getColorFromColorScheme = ( ) => {
    if ( colorScheme === "dark"
        && color === colors.darkGray
        && isDarkModeEnabled
    ) return colors.white;

    return color || colors.darkGray;
  };

  const colorFromColorScheme = getColorFromColorScheme( );

  const style = dropShadow
    ? {
      shadowOpacity: 2,
      textShadowRadius: 4,
      textShadowOffset: { width: 2, height: 2 },
    }
    : null;
  return (
    <Icon
      testID={testID}
      name={isAlias( name )
        ? typedAliasMap[name]
        : name}
      color={colorFromColorScheme}
      size={size}
      style={style}
    />
  );
};
export default INatIcon;
