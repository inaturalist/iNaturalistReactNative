// @flow

import {
  BackButton,
  Heading4,
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

import MainPhotoDisplay from "./MainPhotoDisplay";
import PhotoSelector from "./PhotoSelector";

type Props = {
  editable?: boolean,
  onClose?: Function,
  onDelete?: Function,
  uri?: string,
  photos?: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>
}

const BACK_BUTTON_STYLE = { position: "absolute", start: 0 };

const MediaViewer = ( {
  editable,
  onClose = ( ) => { },
  onDelete,
  uri,
  // uris = []
  photos = []
}: Props ): Node => {
  const uris = photos.map( photo => photo.url || photo.localFilePath );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(
    uris.indexOf( uri ) <= 0
      ? 0
      : uris.indexOf( uri )
  );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );
  const theme = useTheme( );

  const horizontalScroll = useRef( null );

  const { screenWidth } = useDeviceOrientation( );
  const isLargeScreen = screenWidth > BREAKPOINTS.md;

  const scrollToIndex = useCallback( index => {
    // when a user taps a photo in the carousel, the UI needs to automatically
    // scroll to the index of the photo they selected
    setSelectedPhotoIndex( index );
    horizontalScroll?.current?.scrollToIndex( { index, animated: true } );
  }, [setSelectedPhotoIndex] );

  // If we've removed an item the selectedPhoto index might refer to a photo
  // that no longer exists, so change it to the previous one
  useEffect( ( ) => {
    if ( selectedPhotoIndex >= uris.length ) {
      setSelectedPhotoIndex( Math.max( 0, selectedPhotoIndex - 1 ) );
    }
  }, [selectedPhotoIndex, setSelectedPhotoIndex, uris.length] );

  const deleteItem = useCallback( ( ) => {
    const uriToDelete = uris[selectedPhotoIndex]?.toString( );
    setWarningSheet( false );
    if ( onDelete && uriToDelete ) onDelete( uriToDelete );
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
        editable={editable}
        photos={photos}
        selectedPhotoIndex={selectedPhotoIndex}
        horizontalScroll={horizontalScroll}
        setSelectedPhotoIndex={setSelectedPhotoIndex}
        onDelete={( ) => setWarningSheet( true )}
      />
      <PhotoSelector
        photos={photos}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        selectedPhotoIndex={selectedPhotoIndex}
      />
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
