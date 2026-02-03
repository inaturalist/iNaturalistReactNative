import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import classnames from "classnames";
import { BottomSheetStandardBackdrop, Heading4, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useEffect, useRef } from "react";
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
  overflow: "hidden" as const,
};

// eslint-disable-next-line
const noHandle = ( ) => <></>;

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
  const { t } = useTranslation( );
  const sheetRef = useRef<BottomSheetModal>( null );
  const insets = useSafeAreaInsets( );

  const handlePressClose = useCallback( ( ) => {
    if ( onPressClose ) {
      onPressClose( );
    }
  }, [onPressClose] );

  const renderBackdrop = ( props: BottomSheetBackdropProps ) => (
    <BottomSheetStandardBackdrop
      props={props}
      onPress={handlePressClose}
    />
  );

  useEffect( ( ) => {
    if ( hidden ) { return; }
    sheetRef.current?.present( );
  }, [hidden] );

  if ( hidden ) {
    return null;
  }

  return (
    <BottomSheetModal
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      handleComponent={noHandle}
      index={0}
      ref={sheetRef}
      style={marginOnWide}
      accessible={false}
      onDismiss={onDismiss}
    >
      <BottomSheetScrollView>
        <View
          className={classnames(
            "pt-7",
            insets.bottom > 0
              ? "pb-7"
              : null,
          )}
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
          <INatIconButton
            icon="close"
            onPress={handlePressClose}
            size={19}
            className="absolute top-3.5 right-3"
            accessibilityLabel={t( "Close" )}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default BottomSheetV2;
