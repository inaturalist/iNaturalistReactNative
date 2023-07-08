// @flow

import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { BottomSheetStandardBackdrop, Heading4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef
} from "react";
import { IconButton } from "react-native-paper";
import { viewStyles } from "styles/sharedComponents/bottomSheet";

type Props = {
  children: any,
  hide?: boolean,
  snapPoints?: ( string|number )[],
  onChange?: Function,
  handleClose?: Function,
  hideCloseButton?: boolean,
  headerText?: string
}

const DEFAULT_SNAP_POINTS = ["45%"];

const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

const StandardBottomSheet = ( {
  children,
  hide,
  snapPoints = DEFAULT_SNAP_POINTS,
  onChange = null,
  handleClose,
  hideCloseButton = false,
  headerText
}: Props ): Node => {
  const sheetRef = useRef( null );

  // eslint-disable-next-line
  const noHandle = ( ) => <></>;

  const handleClosePress = useCallback( ( ) => {
    if ( handleClose ) {
      handleClose( );
    }
    sheetRef.current?.dismiss( );
  }, [handleClose] );

  const handleSnapPress = useCallback( ( ) => {
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
      index={0}
      snapPoints={snapPoints}
      style={viewStyles.shadow}
      handleComponent={noHandle}
      backdropComponent={renderBackdrop}
      onChange={onChange}
    >
      <BottomSheetView>
        <View className="items-center">
          <Heading4 className="pt-7">{headerText}</Heading4>
        </View>
        {children}
        {!hideCloseButton && (
          <IconButton
            icon="close"
            onPress={handleClose}
            size={19}
            className="absolute top-3 right-3"
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default StandardBottomSheet;
