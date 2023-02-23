// @flow

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef
} from "react";
import { viewStyles } from "styles/sharedComponents/bottomSheet";

type Props = {
  children: any,
  hide?: boolean,
  snapPoints?: Array<string>
}

const SNAP_POINTS = ["45%"];

const StandardBottomSheet = ( { children, hide, snapPoints }: Props ): Node => {
  const sheetRef = useRef( null );

  // eslint-disable-next-line
  const noHandle = ( ) => <></>;

  const handleClosePress = useCallback( () => {
    sheetRef.current?.close();
  }, [] );

  const handleSnapPress = useCallback( ( ) => {
    sheetRef.current?.snapToIndex( 0 );
  }, [] );

  useEffect( ( ) => {
    if ( hide ) {
      handleClosePress( );
    } else {
      handleSnapPress( );
    }
  }, [hide, handleClosePress, handleSnapPress] );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints || SNAP_POINTS}
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
