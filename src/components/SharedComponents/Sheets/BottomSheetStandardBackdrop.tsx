import type {
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import React from "react";

interface Props {
  props: BottomSheetBackdropProps;
  onPress: ( ) => void;
}

const BottomSheetStandardBackdrop = ( { props, onPress }: Props ) => (
  <BottomSheetBackdrop
    {...props}
    onPress={onPress}
    pressBehavior="close"
    appearsOnIndex={0}
    disappearsOnIndex={-1}
  />
);

export default BottomSheetStandardBackdrop;
