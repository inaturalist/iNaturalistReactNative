import type {
  BottomSheetBackdropProps
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop
} from "@gorhom/bottom-sheet";
import React from "react";

type Props = {
  props: BottomSheetBackdropProps,
  onPress: ( ) => void
}

const BottomSheetStandardBackdrop = ( { props, onPress }: Props ) => (
  <BottomSheetBackdrop
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    onPress={onPress}
    pressBehavior="close"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
  />
);

export default BottomSheetStandardBackdrop;
