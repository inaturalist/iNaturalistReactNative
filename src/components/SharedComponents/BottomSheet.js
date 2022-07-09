// @flow

import React, { useEffect, useRef } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";

import type { Node } from "react";
import { viewStyles } from "../../styles/sharedComponents/bottomSheet";

type Props = {
  children: any
}

const BottomSheet = ( { children }: Props ): Node => {
  // ref
  const bottomSheetModalRef = useRef( null );

  const renderBackdrop = props => (
    <BottomSheetBackdrop
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      pressBehavior="close"
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  );

  useEffect( ( ) => {
    // opens bottom sheet modal once when component first loads
    bottomSheetModalRef.current?.present( );
  }, [] );

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableOverDrag={false}
        enablePanDownToClose={false}
        snapPoints={["40%"]}
        backdropComponent={renderBackdrop}
        style={viewStyles.bottomModal}
      >
        {children}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default BottomSheet;
