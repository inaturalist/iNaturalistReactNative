// @flow

import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef
} from "react";
import { viewStyles } from "styles/sharedComponents/bottomSheet";

type Props = {
  children: any,
  hide?: boolean,
  snapPoints?: ( string|number )[],
  backdropComponent?: Function,
  onChange?: Function,
  handleClose?: Function
}

const DEFAULT_SNAP_POINTS = ["45%"];

const StandardBottomSheet = ( {
  children,
  hide,
  snapPoints = DEFAULT_SNAP_POINTS,
  backdropComponent = null,
  onChange = null,
  handleClose
}: Props ): Node => {
  const sheetRef = useRef( null );

  // eslint-disable-next-line
  const noHandle = ( ) => <></>;

  const handleClosePress = useCallback( ( ) => {
    if ( handleClose ) {
      handleClose( );
    }
    sheetRef.current?.close( );
  }, [handleClose] );

  const handleSnapPress = useCallback( ( ) => {
    sheetRef.current?.snapToIndex( 0 );
    sheetRef.current?.present( );
  }, [] );

  useEffect( ( ) => {
    if ( hide ) {
      handleClosePress( );
    } else {
      handleSnapPress( );
    }
  }, [hide, handleClosePress, handleSnapPress] );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      style={viewStyles.shadow}
      handleComponent={noHandle}
      backdropComponent={backdropComponent}
      onChange={onChange}
    >
      <BottomSheetView>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default StandardBottomSheet;
