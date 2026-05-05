import type {
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetModal, BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import classnames from "classnames";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
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
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
}

type SheetHandle = BottomSheet & Partial<Pick<BottomSheetModal, "dismiss" | "present">>;

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
  enablePanDownToClose = true,
  enableContentPanningGesture = true,
}: Props ) => {
  if ( snapPoints ) {
    throw new Error( "BottomSheet does not accept snapPoints as a prop." );
  }

  const { t } = useTranslation( );
  const sheetRef = useRef<SheetHandle>( null );
  const skipNextOnPressCloseRef = useRef( false );
  const insets = useSafeAreaInsets( );

  // The optional `sheet` arg lets the unmount cleanup pass a captured handle;
  // see the cleanup effect below for why that matters.
  const dismissSheet = useCallback( ( sheet = sheetRef.current ) => {
    if ( insideModal ) {
      sheet?.close( );
    } else {
      sheet?.dismiss?.( );
    }
  }, [insideModal] );

  const handleClose = useCallback( ( ) => {
    if ( skipNextOnPressCloseRef.current ) {
      skipNextOnPressCloseRef.current = false;
    } else if ( onPressClose ) {
      onPressClose( );
    }
    dismissSheet( );
  }, [dismissSheet, onPressClose] );

  const renderBackdrop = ( props: BottomSheetBackdropProps ) => (
    <BottomSheetStandardBackdrop
      props={props}
      onPress={onPressClose ?? ( ( ) => {} )}
    />
  );

  const openSheet = useCallback( ( ) => {
    if ( insideModal ) {
      sheetRef.current?.expand( );
    } else {
      sheetRef.current?.present?.( );
    }
  }, [insideModal] );

  useEffect( ( ) => {
    if ( hidden ) {
      skipNextOnPressCloseRef.current = true;
      dismissSheet( );
      return;
    }
    skipNextOnPressCloseRef.current = false;
    openSheet( );
  }, [hidden, openSheet, dismissSheet] );

  // Capture sheetRef.current now: it's null by the time this cleanup runs on unmount,
  // so the captured handle is what actually dismisses the sheet.
  useEffect( ( ) => {
    const sheet = sheetRef.current;
    return ( ) => dismissSheet( sheet );
  }, [dismissSheet] );

  const content = (
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
            disabled={hidden}
            size={19}
            className="absolute top-3.5 right-3"
            accessibilityLabel={t( "Close" )}
          />
        )}
      </View>
    </BottomSheetScrollView>
  );

  // Consider splitting into separate files/components or removing `insideModal` usage
  if ( insideModal ) {
    return (
      <BottomSheet
        backdropComponent={renderBackdrop}
        enableDynamicSizing
        handleComponent={noHandle}
        index={0}
        ref={sheetRef}
        style={marginOnWide}
        accessible={false}
        onClose={handleClose}
        enablePanDownToClose={enablePanDownToClose}
        enableContentPanningGesture={enableContentPanningGesture}
      >
        {content}
      </BottomSheet>
    );
  }

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      handleComponent={noHandle}
      index={0}
      ref={sheetRef as React.RefObject<BottomSheetModal>}
      style={marginOnWide}
      accessible={false}
      onDismiss={handleClose}
      enablePanDownToClose={enablePanDownToClose}
      enableContentPanningGesture={enableContentPanningGesture}
    >
      {content}
    </BottomSheetModal>
  );
};

export default StandardBottomSheet;
