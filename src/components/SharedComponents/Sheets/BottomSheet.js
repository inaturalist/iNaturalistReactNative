// @flow

import BottomSheet, {
  BottomSheetModal, BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import classnames from "classnames";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useRef
} from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "sharedHooks";

type Props = {
  children: Node,
  hidden?: boolean,
  onChange?: Function,
  handleClose?: Function,
  hideCloseButton?: boolean,
  headerText?: string,
  onLayout?: Function,
  snapPoints?: Array<string>,
  insideModal?: boolean,
  keyboardShouldPersistTaps: string
}

const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

const StandardBottomSheet = ( {
  children,
  hidden,
  onChange = null,
  handleClose,
  hideCloseButton = false,
  headerText,
  onLayout,
  snapPoints,
  insideModal,
  keyboardShouldPersistTaps = "never"
}: Props ): Node => {
  if ( snapPoints ) {
    throw new Error( "BottomSheet does not accept snapPoints as a prop." );
  }

  const { t } = useTranslation( );
  const sheetRef = useRef( null );
  const insets = useSafeAreaInsets( );

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
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      handleComponent={noHandle}
      index={0}
      onChange={onChange || handleBackdropPress}
      ref={sheetRef}
      style={marginOnWide}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      >
        <View
          className={classnames(
            "pt-7",
            insets.bottom > 0
              ? "pb-7"
              : null
          )}
          onLayout={onLayout}
        >
          <View className="items-center">
            <Heading4 testID="bottom-sheet-header">{headerText}</Heading4>
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
      </BottomSheetScrollView>
    </BottomSheetComponent>
  );
};

export default StandardBottomSheet;
