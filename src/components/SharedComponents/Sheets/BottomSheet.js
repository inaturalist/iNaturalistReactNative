// @flow

import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints
} from "@gorhom/bottom-sheet";
import classnames from "classnames";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef
} from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets( );

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

  const { width } = Dimensions.get( "window" );
  const marginOnWide = {
    marginHorizontal: width > 500
      ? ( width - 500 ) / 2
      : 0
  };

  return (
    <BottomSheetComponent
      ref={sheetRef}
      index={0}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      style={[viewStyles.shadow, marginOnWide]}
      handleComponent={noHandle}
      backdropComponent={renderBackdrop}
      onChange={onChange || handleBackdropPress}
    >
      <BottomSheetView onLayout={handleContentLayout}>
        <View
          className={classnames(
            "pt-7",
            insets.bottom > 0
              ? "pb-7"
              : null
          )}
        >
          <View className="items-center">
            <Heading4>{headerText}</Heading4>
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
        </View>
      </BottomSheetView>
    </BottomSheetComponent>
  );
};

export default StandardBottomSheet;
