import BottomSheet, {
  BottomSheetModal, BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import classnames from "classnames";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "sharedHooks";

const { width } = Dimensions.get( "window" );
const marginOnWide = {
  marginHorizontal: width > 500
    ? ( width - 500 ) / 2
    : 0,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: "hidden",
};

// eslint-disable-next-line
const noHandle = ( ) => <></>;

interface Props {
  children: React.JSX.Element;
  hidden?: boolean;
  hideCloseButton?: boolean;
  headerText?: string;
  onLayout?: ( event: object ) => void;
  // OnPressClose *does* get called whenever bottom sheet is dismissed
  onPressClose?: ( ) => void;
  snapPoints?: string[];
  insideModal?: boolean;
  keyboardShouldPersistTaps?: string;
  testID?: string;
  containerClass?: string;
  scrollEnabled?: boolean;
}

const StandardBottomSheet = ( {
  children,
  hidden,
  hideCloseButton = false,
  headerText,
  onLayout,
  onPressClose,
  snapPoints,
  insideModal,
  keyboardShouldPersistTaps = "never",
  containerClass,
  testID,
  scrollEnabled = true,
}: Props ): Node => {
  if ( snapPoints ) {
    throw new Error( "BottomSheet does not accept snapPoints as a prop." );
  }

  const { t } = useTranslation( );
  const sheetRef = useRef<BottomSheet>( null );
  const insets = useSafeAreaInsets( );

  const handleClose = useCallback( ( ) => {
    if ( onPressClose ) onPressClose( );

    if ( insideModal ) {
      sheetRef.current?.collapse( );
    } else {
      sheetRef.current?.dismiss( );
    }
  }, [insideModal, onPressClose] );

  const renderBackdrop = props => (
    <BottomSheetStandardBackdrop
      props={props}
      onPress={onPressClose}
    />
  );

  const handleSnapPress = useCallback( ( ) => {
    if ( insideModal ) {
      sheetRef.current?.expand( );
    } else {
      sheetRef.current?.present( );
    }
  }, [insideModal] );

  useEffect( ( ) => {
    if ( hidden ) { return; }
    handleSnapPress( );
  }, [hidden, handleSnapPress] );

  const BottomSheetComponent = insideModal
    ? BottomSheet
    : BottomSheetModal;

  if ( hidden ) {
    return null;
  }

  return (
    <BottomSheetComponent
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      handleComponent={noHandle}
      index={0}
      ref={sheetRef}
      style={marginOnWide}
      accessible={false}
      onDismiss={handleClose}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        scrollEnabled={scrollEnabled}
      >
        <View
          className={classnames(
            "pt-7",
            insets.bottom > 0
              ? "pb-7"
              : null,
            containerClass,
          )}
          onLayout={onLayout}
          // Not ideal, but @gorhom/bottom-sheet components don't support
          // testID
          testID={testID}
        >
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
