// @flow

import { WarningSheet } from "components/SharedComponents";
import { SafeAreaView } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { StatusBar } from "react-native";
import Photo from "realmModels/Photo.ts";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";
import useTranslation from "sharedHooks/useTranslation.ts";

import MainMediaDisplay from "./MainMediaDisplay";
import MediaSelector from "./MediaSelector";
import MediaViewerHeader from "./MediaViewerHeader";

type Props = {
  autoPlaySound?: boolean, // automatically start playing a sound when it is visible
  editable?: boolean,
  deleting?: boolean,
  // Optional component to use as the header
  header?: Function,
  onClose?: Function,
  onDeletePhoto?: Function,
  onDeleteSound?: Function,
  photos?: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  sounds?: Array<{
    file_url: string
  }>,
  uri?: string | null
}

const MediaViewer = ( {
  autoPlaySound,
  editable,
  deleting,
  header,
  onClose = ( ) => undefined,
  onDeletePhoto,
  onDeleteSound,
  photos = [],
  sounds = [],
  uri
}: Props ): Node => {
  const uris = useMemo( ( ) => ( [
    ...photos.map( photo => photo.url || Photo.getLocalPhotoUri( photo.localFilePath ) ),
    ...sounds.map( sound => sound.file_url )
  ] ), [photos, sounds] );

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(
    uris.indexOf( uri ) <= 0
      ? 0
      : uris.indexOf( uri )
  );
  const { t } = useTranslation( );
  const [
    mediaToDelete,
    setMediaToDelete
  ]: [null | { type: string, uri: string }, Function] = useState( null );

  const horizontalScroll = useRef( null );

  const { screenWidth } = useDeviceOrientation( );
  const isLargeScreen = screenWidth > BREAKPOINTS.md;

  const scrollToIndex = useCallback( index => {
    // when a user taps an item in the carousel, the UI needs to automatically
    // scroll to the index of the item they selected
    setSelectedMediaIndex( index );
    horizontalScroll?.current?.scrollToIndex( { index, animated: true } );
  }, [setSelectedMediaIndex] );

  // If we've removed an item the selectedPhoto index might refer to a item
  // that no longer exists, so change it to the previous one
  useEffect( ( ) => {
    if ( uris.length > 0 && selectedMediaIndex >= uris.length ) {
      const newIndex = Math.max( 0, selectedMediaIndex - 1 );
      setSelectedMediaIndex( newIndex );
      horizontalScroll?.current?.scrollToIndex( {
        index: newIndex,
        animated: false
      } );
    }
  }, [selectedMediaIndex, setSelectedMediaIndex, uris.length] );

  const confirmDelete = useCallback( ( ) => {
    if ( mediaToDelete?.type === "photo" && onDeletePhoto ) {
      onDeletePhoto( mediaToDelete.uri );
    } else if ( mediaToDelete?.type === "sound" && onDeleteSound ) {
      onDeleteSound( mediaToDelete.uri );
    }
    setMediaToDelete( null );
  }, [
    onDeletePhoto,
    onDeleteSound,
    mediaToDelete?.type,
    mediaToDelete?.uri,
    setMediaToDelete
  ] );

  return (
    <SafeAreaView className="flex-1 bg-black" testID="MediaViewer">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {
        header
          ? header( { onClose, photoCount: uris.length } )
          : (
            <MediaViewerHeader
              onClose={onClose}
              photoCount={photos.length}
              soundCount={sounds.length}
            />
          )
      }
      <MainMediaDisplay
        autoPlaySound={autoPlaySound}
        editable={editable}
        photos={photos}
        sounds={sounds}
        onClose={onClose}
        selectedMediaIndex={selectedMediaIndex}
        horizontalScroll={horizontalScroll}
        setSelectedMediaIndex={setSelectedMediaIndex}
        onDeletePhoto={photoUri => setMediaToDelete( { type: "photo", uri: photoUri } )}
        onDeleteSound={soundUri => setMediaToDelete( { type: "sound", uri: soundUri } )}
      />
      <MediaSelector
        photos={photos}
        sounds={sounds}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        selectedMediaIndex={selectedMediaIndex}
      />
      {( mediaToDelete || deleting ) && (
        <WarningSheet
          onPressClose={( ) => setMediaToDelete( null )}
          loading={deleting}
          confirm={confirmDelete}
          headerText={t( "DISCARD-MEDIA--question" )}
          buttonText={t( "DISCARD" )}
          secondButtonText={t( "CANCEL" )}
          handleSecondButtonPress={( ) => setMediaToDelete( null )}
          insideModal
          testID="MediaViewer.DiscardMediaWarningSheet"
        />
      )}
    </SafeAreaView>
  );
};

export default MediaViewer;
