// @flow

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import type { Node } from "react";
import React, { useMemo, useRef } from "react";

import { viewStyles } from "../../styles/sharedComponents/bottomSheet";

type Props = {
  children: any
}

const StandardBottomSheet = ( { children }: Props ): Node => {
  const sheetRef = useRef( null );
  const snapPoints = useMemo( () => ["30%"], [] );

  // eslint-disable-next-line
  const noHandle = ( ) => <></>;

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      style={viewStyles.shadow}
      handleComponent={noHandle}
    >
      <BottomSheetView style={viewStyles.bottomSheet}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default StandardBottomSheet;
