// @flow

import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints
} from "@gorhom/bottom-sheet";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef
} from "react";
import { useTranslation } from "sharedHooks";
import { viewStyles } from "styles/sharedComponents/bottomSheet";

type Props = {
  children: Node,
  hidden?: boolean,
  onChange?: Function,
  handleClose?: Function,
  hideCloseButton?: boolean,
  headerText?: string,
  snapPoints?: any,
  insideModal?: boolean
}

const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

const StandardBottomSheet = ( {
  children,
  hidden,
  onChange = null,
  handleClose,
  hideCloseButton = false,
  headerText,
  snapPoints,
  insideModal
}: Props ): Node => {
  if ( snapPoints ) {
    throw new Error( "BottomSheet does not accept snapPoints as a prop." );
  }

  const { t } = useTranslation( );
  const sheetRef = useRef( null );

  const initialSnapPoints = useMemo( () => ["CONTENT_HEIGHT"], [] );

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout
  } = useBottomSheetDynamicSnapPoints( initialSnapPoints );

  // eslint-disable-next-line
  const noHandle = ( ) => <></>;

  const handleBackdropPress = useCallback( position => {
    if ( handleClose && position === -1 ) {
      handleClose( );
    }
  }, [handleClose] );

  const handleClosePress = useCallback( ( ) => {
    if ( handleClose ) {
      handleClose( );
    }
    if ( insideModal ) {
      sheetRef.current?.collapse( );
    } else {
      sheetRef.current?.dismiss( );
    }
  }, [handleClose, insideModal] );

  const handleSnapPress = useCallback( ( ) => {
    if ( insideModal ) {
      sheetRef.current?.expand( );
    } else {
      sheetRef.current?.present( );
    }
  }, [insideModal] );

  useEffect( ( ) => {
    if ( hidden ) {
      handleClosePress( );
    } else {
      handleSnapPress( );
    }
  }, [hidden, handleClosePress, handleSnapPress] );

  const BottomSheetComponent = insideModal
    ? BottomSheet
    : BottomSheetModal;

  return (
    <BottomSheetComponent
      ref={sheetRef}
      index={0}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      style={viewStyles.shadow}
      handleComponent={noHandle}
      backdropComponent={renderBackdrop}
      onChange={onChange || handleBackdropPress}
    >
      <SafeAreaView>
        <BottomSheetView onLayout={handleContentLayout}>
          <View className="items-center">
            <Heading4 className="pt-7">{headerText}</Heading4>
          </View>
          {children}
          {!hideCloseButton && (
            <INatIconButton
              icon="close"
              onPress={handleClose}
              size={19}
              className="absolute top-3.5 right-3"
              accessibilityState={{ disabled: hidden }}
              accessibilityLabel={t( "Close" )}
            />
          )}
        </BottomSheetView>
      </SafeAreaView>
    </BottomSheetComponent>
  );
};

export default StandardBottomSheet;
