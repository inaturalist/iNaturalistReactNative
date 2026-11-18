import { WarningSheet } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StatusBar } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Photo from "realmModels/Photo";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import type { CropRectangle } from "sharedHelpers/getCropRectangle";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";

import useEditLocalPhoto from "./hooks/useEditLocalPhoto";
import MainMediaDisplay from "./MainMediaDisplay";
import MediaSelector from "./MediaSelector";
import MediaViewerHeader from "./MediaViewerHeader";
import PhotoCropper from "./PhotoCropper";

interface MediaToDelete {
  type: "sound" | "photo";
  uri: string;
}

interface PhotoItem {
  attribution?: string;
  licenseCode?: string;
  localFilePath?: string;
  url?: string;
}

interface SoundItem {
  file_url: string;
  hidden: boolean;
}

interface Props {
  autoPlaySound?: boolean; // automatically start playing a sound when it is visible
  editable?: boolean;
  deleting?: boolean;
  // Optional component to use as the header
  header?: (
    { onClose, photoCount }: { onClose: ( ) => void; photoCount: number}
  ) => React.JSX.Element;
  onClose?: ( ) => void;
  // Called when the cropper opens or closes
  onCroppingChange?: ( cropping: boolean ) => void;
  onDeletePhoto?: ( uri: string ) => void;
  onDeleteSound?: ( uri: string ) => void;
  // Called with a photo's current URI and the path of its edited copy.
  onEditPhoto?: ( uri: string, newLocalFilePath: string ) => void;
  photos?: PhotoItem[];
  sounds?: SoundItem[];
  uri?: string | null;
}

const MediaViewer = ( {
  autoPlaySound,
  editable,
  deleting,
  header,
  onClose = ( ) => undefined,
  onCroppingChange,
  onDeletePhoto,
  onDeleteSound,
  onEditPhoto,
  photos = [],
  sounds = [],
  uri,
}: Props ) => {
  const insets = useSafeAreaInsets();
  const uris = useMemo( ( ) => ( [
    ...photos.map( photo => photo.url || Photo.getLocalPhotoUri( photo.localFilePath ) ),
    ...sounds.map( sound => sound.file_url ),
  ] ), [photos, sounds] );

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(
    uris.indexOf( uri ) <= 0
      ? 0
      : uris.indexOf( uri ),
  );
  const { t } = useTranslation( );
  const [mediaToDelete, setMediaToDelete] = useState<MediaToDelete | null>( null );

  const horizontalScroll = useRef<ICarouselInstance>( null );

  const { screenWidth } = useDeviceOrientation( );
  const isLargeScreen = screenWidth > BREAKPOINTS.md;

  const scrollToIndex = useCallback( ( index: number ) => {
    // when a user taps an item in the carousel, the UI needs to automatically
    // scroll to the index of the item they selected
    setSelectedMediaIndex( index );
    horizontalScroll?.current?.scrollTo( { index, animated: true } );
  }, [setSelectedMediaIndex] );

  // If we've removed an item the selectedPhoto index might refer to a item
  // that no longer exists, so change it to the previous one
  useEffect( ( ) => {
    if ( uris.length > 0 && selectedMediaIndex >= uris.length ) {
      const newIndex = Math.max( 0, selectedMediaIndex - 1 );
      setSelectedMediaIndex( newIndex );
      horizontalScroll?.current?.scrollTo( {
        index: newIndex,
        animated: false,
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
    setMediaToDelete,
  ] );

  const applyPhotoEdit = useEditLocalPhoto( onEditPhoto );

  const rotatePhoto = useCallback(
    // A quarter turn counterclockwise, matching the rotate icon
    ( localFilePath: string ) => applyPhotoEdit( localFilePath, { rotation: 270 } ),
    [applyPhotoEdit],
  );

  // The photo being cropped, which replaces the carousel while set
  const [localFilePathToCrop, setLocalFilePathToCrop] = useState<string | null>( null );
  const [savingCrop, setSavingCrop] = useState( false );
  const uriToCrop = Photo.getLocalPhotoUri( localFilePathToCrop || undefined );
  const cropping = !!uriToCrop;
  useEffect( ( ) => {
    onCroppingChange?.( cropping );
    return ( ) => onCroppingChange?.( false );
  }, [cropping, onCroppingChange] );
  const closeCropper = useCallback( ( ) => setLocalFilePathToCrop( null ), [] );
  const cropPhoto = useCallback( async ( cropRectangle: CropRectangle ) => {
    if ( !localFilePathToCrop ) return;
    setSavingCrop( true );
    await applyPhotoEdit( localFilePathToCrop, { rotation: 0, cropRectangle } );
    setSavingCrop( false );
    setLocalFilePathToCrop( null );
  }, [applyPhotoEdit, localFilePathToCrop] );

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      testID="MediaViewer"
    >
      <StatusBar barStyle="light-content" />
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
      {uriToCrop
        ? (
          <PhotoCropper
            uri={uriToCrop}
            saving={savingCrop}
            onCancel={closeCropper}
            onCrop={cropPhoto}
          />
        )
        : (
          <>
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
              onCropPhoto={onEditPhoto
                ? setLocalFilePathToCrop
                : undefined}
              onRotatePhoto={onEditPhoto
                ? rotatePhoto
                : undefined}
            />
            <MediaSelector
              photos={photos}
              sounds={sounds}
              scrollToIndex={scrollToIndex}
              isLargeScreen={isLargeScreen}
              selectedMediaIndex={selectedMediaIndex}
            />
          </>
        )}
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
    </View>
  );
};

export default MediaViewer;
