// @flow

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useMemo, useRef
} from "react";

import { viewStyles } from "../../styles/sharedComponents/bottomSheet";

type Props = {
  children: any,
  hasScrolled: boolean
}

const StandardBottomSheet = ( { children, hasScrolled }: Props ): Node => {
  const sheetRef = useRef( null );
  const snapPoints = useMemo( () => ["45%"], [] );

  // eslint-disable-next-line
  const noHandle = ( ) => <></>;

  const handleClosePress = useCallback( () => {
    sheetRef.current?.close();
  }, [] );

  const handleSnapPress = useCallback( ( ) => {
    sheetRef.current?.snapToIndex( 0 );
  }, [] );

  useEffect( ( ) => {
    if ( hasScrolled ) {
      handleClosePress( );
    } else {
      handleSnapPress( );
    }
  }, [hasScrolled, handleClosePress, handleSnapPress] );

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
