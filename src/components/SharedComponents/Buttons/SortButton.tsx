import React from "react";
import { getShadow } from "styles/global";

import INatIconButton from "./INatIconButton";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

interface Props {
  onPress: () => void;
  accessibilityLabel: string;
}

const SortButton = ( { onPress, accessibilityLabel }: Props ) => (
  <INatIconButton
    icon="sort"
    size={24}
    className="bg-white rounded-full h-[46px] w-[46px] border-[1px] border-lightGray
      absolute bottom-5 z-10 right-5"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    style={DROP_SHADOW}
  />
);

export default SortButton;
