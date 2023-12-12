// @flow

import classnames from "classnames";
import {
  BackButton,
  Heading4,
  TransparentCircleButton,
  WarningSheet
} from "components/SharedComponents";
import {
  SafeAreaView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { StatusBar } from "react-native";
import { useTheme } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import MainPhotoDisplay from "./MainPhotoDisplay";
import PhotoSelector from "./PhotoSelector";

type Props = {
  editable?: boolean,
  onClose?: Function,
  onDelete?: Function,
  uri?: string,
  uris?: Array<string>
}

const BACK_BUTTON_STYLE = { position: "absolute", start: 0 };

const MediaViewer = ( {
  editable,
  onClose = ( ) => { },
  onDelete,
  uri,
  uris = []
}: Props ): Node => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(
    uris.indexOf( uri ) <= 0
      ? 0
      : uris.indexOf( uri )
  );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );
  const theme = useTheme( );

  const atFirstPhoto = selectedPhotoIndex === 0;
  const atLastPhoto = selectedPhotoIndex === uris.length - 1;

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

  // If we've removed an item the selectedPhoto index might refer to a photo
  // that no longer exists, so change it to the previous one
  useEffect( ( ) => {
    if ( selectedPhotoIndex >= uris.length ) {
      setSelectedPhotoIndex( Math.max( 0, selectedPhotoIndex - 1 ) );
    }
  }, [selectedPhotoIndex, setSelectedPhotoIndex, uris.length] );

  const deleteItem = useCallback( ( ) => {
    const uriToDelete = uris[selectedPhotoIndex].toString( );
    setWarningSheet( false );
    if ( onDelete ) onDelete( uriToDelete );
  }, [
    onDelete,
    selectedPhotoIndex,
    setWarningSheet,
    uris
  ] );

  return (
    <SafeAreaView className="flex-1 bg-black" testID="MediaViewer">
      <StatusBar hidden barStyle="light-content" backgroundColor="black" />
      <View className="flex-row items-center justify-center min-h-[44]">
        <BackButton
          inCustomHeader
          color={theme.colors.onPrimary}
          customStyles={BACK_BUTTON_STYLE}
          onPress={onClose}
        />
        <Heading4 className="color-white">
          {t( "X-PHOTOS", { photoCount: uris.length } )}
        </Heading4>
      </View>
      <MainPhotoDisplay
        photoUris={uris}
        selectedPhotoIndex={selectedPhotoIndex}
        handleScrollEndDrag={handleScrollEndDrag}
        horizontalScroll={horizontalScroll}
      />
      <PhotoSelector
        photoUris={uris}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        isLandscapeMode={isLandscapeMode}
        selectedPhotoIndex={selectedPhotoIndex}
      />
      { editable && (
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
            onPress={( ) => setWarningSheet( true )}
            icon="trash-outline"
            color={colors.white}
            accessibilityLabel={t( "Delete" )}
          />
        </View>
      )}
      {warningSheet && (
        <WarningSheet
          handleClose={( ) => setWarningSheet( false )}
          confirm={deleteItem}
          headerText={t( "DISCARD-MEDIA" )}
          snapPoints={[178]}
          buttonText={t( "DISCARD" )}
          secondButtonText={t( "CANCEL" )}
          handleSecondButtonPress={( ) => setWarningSheet( false )}
          insideModal
        />
      )}
    </SafeAreaView>
  );
};

export default MediaViewer;
