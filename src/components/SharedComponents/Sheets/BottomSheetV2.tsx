import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "sharedHooks";

// This component is an iteration on BottomSheet.
// The main motivation was to avoid messing with the inconsistent use of the
// onPressClose prop, whis gets passed to onDismiss and called differently depending
// on whether the X button or backdrop is pressed.

// To start, it contains just what's necessary for the usage in SuggestIDSheet.

const { width } = Dimensions.get( "window" );

const MAX_HEIGHT_FRACTION = 0.9;

const styles = StyleSheet.create( {
  marginOnWide: {
    marginHorizontal: width > 500
      ? ( width - 500 ) / 2
      : 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
} );

// eslint-disable-next-line
const noHandle = ( ) => <></>;

const STICKY_HEADER = [0];

interface Props {
  children: React.JSX.Element;
  hidden?: boolean;
  headerText?: string;
  onPressClose?: ( ) => void;
  onDismiss?: ( ) => void;
}

const BottomSheetV2 = ( {
  children,
  hidden,
  headerText,
  onPressClose,
  onDismiss,
}: Props ): React.JSX.Element | null => {
  const { bottom } = useSafeAreaInsets( );
  const { height: windowHeight } = useWindowDimensions( );
  const { t } = useTranslation( );
  const sheetRef = useRef<BottomSheetModal>( null );
  const skipNextOnDismissRef = useRef( false );

  const handlePressClose = useCallback( ( ) => {
    if ( onPressClose ) {
      onPressClose( );
    }
  }, [onPressClose] );

  const handleDismiss = useCallback( ( ) => {
    if ( skipNextOnDismissRef.current ) {
      skipNextOnDismissRef.current = false;
      return;
    }
    if ( onDismiss ) {
      onDismiss( );
    }
  }, [onDismiss] );

  const renderBackdrop = ( props: BottomSheetBackdropProps ) => (
    <BottomSheetStandardBackdrop
      props={props}
      onPress={handlePressClose}
    />
  );

  useEffect( ( ) => {
    if ( hidden ) {
      skipNextOnDismissRef.current = true;
      sheetRef.current?.dismiss( );
      return;
    }
    skipNextOnDismissRef.current = false;
    sheetRef.current?.present( );
  }, [hidden] );

  useEffect( ( ) => {
    const sheet = sheetRef.current;
    return ( ) => {
      sheet?.dismiss( );
    };
  }, [] );

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      // There is no handle to drag, and dragging the content only ever snaps back, so the
      // gesture does nothing but risk leaving the sheet somewhere it should not be
      enableContentPanningGesture={false}
      handleComponent={noHandle}
      maxDynamicContentSize={windowHeight * MAX_HEIGHT_FRACTION}
      index={0}
      ref={sheetRef}
      style={styles.marginOnWide}
      accessible={false}
      onDismiss={handleDismiss}
    >
      <BottomSheetScrollView stickyHeaderIndices={STICKY_HEADER}>
        <View className="pt-7 bg-white">
          {!headerText
            ? null
            : (
              <View className="mx-12 flex">
                <Heading4
                  testID="bottom-sheet-header"
                  className="w-full text-center"
                >
                  {headerText}
                </Heading4>
              </View>
            )}
          <INatIconButton
            icon="close"
            onPress={handlePressClose}
            size={19}
            className="absolute top-3.5 right-3"
            accessibilityLabel={t( "Close" )}
          />
        </View>
        <View
          style={{
            paddingBottom: bottom,
          }}
        >
          {children}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default BottomSheetV2;
