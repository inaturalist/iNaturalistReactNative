// @flow

import {
  BottomSheetBackdrop
} from "@gorhom/bottom-sheet";
import type { Node } from "react";
import React from "react";

type Props = {
  props: Object
}

const BottomSheetStandardBackdrop = ( { props }: Props ): Node => (
  <BottomSheetBackdrop
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    pressBehavior="close"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
  />
);

export default BottomSheetStandardBackdrop;
