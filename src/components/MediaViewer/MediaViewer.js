// @flow

import { useRoute } from "@react-navigation/native";
import classnames from "classnames";
import { TransparentCircleButton, WarningSheet } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useRef,
  useState
} from "react";
import { StatusBar } from "react-native";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import MainPhotoDisplay from "./MainPhotoDisplay";
import PhotoSelector from "./PhotoSelector";

type Props = {
  onDelete: Function,
  urls: Array<string>
}

const MediaViewer = ( {
  onDelete,
  urls = []
}: Props ): Node => {
  const { params } = useRoute( );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( params?.index );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );

  const atFirstPhoto = selectedPhotoIndex === 0;
  const atLastPhoto = selectedPhotoIndex === urls.length - 1;

  const handleScrollLeft = index => {
    if ( atFirstPhoto ) { return; }
    setSelectedPhotoIndex( index );
  };

  const handleScrollRight = index => {
    if ( atLastPhoto ) { return; }
    setSelectedPhotoIndex( index );
  };

  const horizontalScroll = useRef( null );

  const { isLandscapeMode, screenWidth } = useDeviceOrientation( );
  const isLargeScreen = screenWidth > BREAKPOINTS.md;

  const showWarningSheet = ( ) => setWarningSheet( true );
  const hideWarningSheet = ( ) => setWarningSheet( false );

  const scrollToIndex = useCallback( index => {
    // when a user taps a photo in the carousel, the UI needs to automatically
    // scroll to the index of the photo they selected
    setSelectedPhotoIndex( index );
    horizontalScroll?.current?.scrollToIndex( { index, animated: true } );
  }, [setSelectedPhotoIndex] );

  const handleScrollEndDrag = e => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = screenWidth * selectedPhotoIndex;

    // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
    const index = Math.floor(
      Math.floor( x ) / Math.floor( layoutMeasurement.width )
    );

    if ( x > currentOffset ) {
      handleScrollRight( index );
    } else if ( x < currentOffset ) {
      handleScrollLeft( index );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" testID="MediaViewer">
      <StatusBar barStyle="light-content" />
      {warningSheet && (
        <WarningSheet
          handleClose={hideWarningSheet}
          confirm={onDelete}
          headerText={t( "DISCARD-MEDIA" )}
          snapPoints={[178]}
          buttonText={t( "DISCARD" )}
          secondButtonText={t( "CANCEL" )}
          handleSecondButtonPress={hideWarningSheet}
        />
      )}
      <MainPhotoDisplay
        photoUris={urls}
        selectedPhotoIndex={selectedPhotoIndex}
        handleScrollEndDrag={handleScrollEndDrag}
        horizontalScroll={horizontalScroll}
      />
      <PhotoSelector
        photoUris={urls}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        isLandscapeMode={isLandscapeMode}
        selectedPhotoIndex={selectedPhotoIndex}
      />
      <View
        className={classnames(
          "absolute right-[14px]",
          {
            "bottom-[138px]": isLargeScreen,
            "bottom-[91px]": !isLargeScreen
          }
        )}
      >
        <TransparentCircleButton
          onPress={showWarningSheet}
          icon="trash-outline"
          color={colors.white}
          accessibilityLabel={t( "Delete" )}
        />
      </View>
    </SafeAreaView>
  );
};

export default MediaViewer;
