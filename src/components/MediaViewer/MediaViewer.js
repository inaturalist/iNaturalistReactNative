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
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";

import MainMediaDisplay from "./MainMediaDisplay";
import MediaSelector from "./MediaSelector";
import MediaViewerHeader from "./MediaViewerHeader";

type Props = {
  editable?: boolean,
  // Optional component to use as the header
  header?: Function,
  onClose?: Function,
  onDelete?: Function,
  photos?: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  sounds?: Array<{
    id?: number,
    file_url: string
  }>,
  uri?: string
}

const MediaViewer = ( {
  editable,
  header,
  onClose = ( ) => { },
  onDelete,
  photos = [],
  sounds = [],
  uri
}: Props ): Node => {
  const uris = useMemo( ( ) => ( [
    ...photos.map( photo => photo.url || photo.localFilePath ),
    ...sounds.map( sound => sound.file_url )
  ] ), [photos, sounds] );

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(
    uris.indexOf( uri ) <= 0
      ? 0
      : uris.indexOf( uri )
  );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );

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
    if ( selectedMediaIndex >= uris.length ) {
      setSelectedMediaIndex( Math.max( 0, selectedMediaIndex - 1 ) );
    }
  }, [selectedMediaIndex, setSelectedMediaIndex, uris.length] );

  const deleteItem = useCallback( ( ) => {
    const uriToDelete = uris[selectedMediaIndex]?.toString( );
    setWarningSheet( false );
    if ( onDelete && uriToDelete ) onDelete( uriToDelete );
  }, [
    onDelete,
    selectedMediaIndex,
    setWarningSheet,
    uris
  ] );

  return (
    <SafeAreaView className="flex-1 bg-black" testID="MediaViewer">
      <StatusBar hidden barStyle="light-content" backgroundColor="black" />
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
        editable={editable}
        photos={photos}
        sounds={sounds}
        selectedMediaIndex={selectedMediaIndex}
        horizontalScroll={horizontalScroll}
        setSelectedMediaIndex={setSelectedMediaIndex}
        onDelete={( ) => setWarningSheet( true )}
      />
      <MediaSelector
        photos={photos}
        sounds={sounds}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        selectedMediaIndex={selectedMediaIndex}
      />
      {warningSheet && (
        <WarningSheet
          handleClose={( ) => setWarningSheet( false )}
          confirm={deleteItem}
          headerText={t( "DISCARD-MEDIA" )}
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
