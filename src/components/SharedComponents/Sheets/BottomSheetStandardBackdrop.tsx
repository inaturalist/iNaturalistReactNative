import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from "@gorhom/bottom-sheet";
import React from "react";

type Props = {
  props: BottomSheetBackdropProps
}

const BottomSheetStandardBackdrop = ( { props }: Props ) => (
  <BottomSheetBackdrop
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    pressBehavior="close"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
  />
);

export default BottomSheetStandardBackdrop;
