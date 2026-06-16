import SoundContainer from "components/ObsDetailsSharedComponents/Media/SoundContainer";
import {
  TransparentCircleButton,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo, useState } from "react";
import type { PanGesture } from "react-native-gesture-handler";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import type { CarouselRenderItem, ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import Photo from "realmModels/Photo";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";

import AttributionButton from "./AttributionButton";
import CustomImageZoom from "./CustomImageZoom";

interface PhotoItem {
  attribution?: string;
  licenseCode?: string;
  localFilePath?: string;
  type: "photo";
  url: string;
}

interface SoundItem {
  file_url: string;
  hidden: boolean;
  type: "sound";
}

interface Props {
  autoPlaySound?: boolean; // automatically start playing a sound when it is visible
  editable?: boolean;
  horizontalScroll: React.Ref<ICarouselInstance>;
  onDeletePhoto: ( uri: string ) => void;
  onClose: ( ) => void;
  onDeleteSound: ( uri: string ) => void;
  photos: Omit<PhotoItem, "type">[];
  sounds?: Omit<SoundItem, "type">[];
  selectedMediaIndex: number;
  setSelectedMediaIndex: ( index: number ) => void;
}

const MainMediaDisplay = ( {
  autoPlaySound,
  editable,
  horizontalScroll,
  onDeletePhoto,
  onDeleteSound,
  onClose,
  photos,
  sounds = [],
  selectedMediaIndex,
  setSelectedMediaIndex,
}: Props ) => {
  const { t } = useTranslation( );
  const { screenWidth } = useDeviceOrientation( );
  const [zooming, setZooming] = useState( false );
  const items = useMemo( ( ) => ( [
    ...photos.map( photo => ( { ...photo, type: "photo" as const } ) ),
    ...sounds.map( sound => ( { ...sound, type: "sound" as const } ) ),
  ] ), [photos, sounds] );

  const deletePhotoLabel = t( "Delete-photo" );
  const deleteSoundLabel = t( "Delete-sound" );

  const renderPhoto = ( photo: PhotoItem ) => {
    const uri = Photo.displayLocalOrRemoteLargePhoto( photo );
    const hasAttribution = photo?.attribution;
    return (
      <View className="flex-1">
        <CustomImageZoom
          uri={uri}
          setZooming={setZooming}
          selectedMediaIndex={selectedMediaIndex}
        />
        {
          editable
            ? (
              <View className="absolute bottom-4 right-4">
                <TransparentCircleButton
                  onPress={( ) => onDeletePhoto(
                    Photo.getLocalPhotoUri( photo.localFilePath )
                    || photo.url,
                  )}
                  icon="trash-outline"
                  accessibilityLabel={deletePhotoLabel}
                />
              </View>
            )
            : (
              hasAttribution
              && (
                <AttributionButton
                  licenseCode={photo.licenseCode}
                  attribution={photo.attribution}
                  optionalClasses="absolute top-4 right-4"
                />
              )
            )
        }
      </View>
    );
  };

  const renderSound = ( sound: SoundItem ) => (
    <View
      className="flex-1 justify-center items-center"
    >
      <SoundContainer
        autoPlay={autoPlaySound}
        sizeClass="h-72 w-screen"
        sound={sound}
        isVisible={items.indexOf( sound ) === selectedMediaIndex}
      />
      {
        editable && (
          <View className="absolute bottom-4 right-4">
            <TransparentCircleButton
              onPress={( ) => onDeleteSound( sound.file_url )}
              icon="trash-outline"
              accessibilityLabel={deleteSoundLabel}
            />
          </View>
        )
      }
    </View>
  );

  const renderItem: CarouselRenderItem<PhotoItem | SoundItem> = ( { item } ) => (
    item.type === "photo"
      ? renderPhoto( item )
      : renderSound( item )
  );

  // Must be stable: onConfigurePanGesture is a useMemo dependency inside the Carousel
  const onConfigurePanGesture = useCallback( ( panGesture: PanGesture ) => {
    panGesture
      // Page only on clearly horizontal drags; leave vertical intent as swipe-to-close
      .activeOffsetX( [-10, 10] )
      .failOffsetY( [-15, 15] )
      // A second finger means pinch-to-zoom do not pan
      .maxPointers( 1 );
  }, [] );

  const swipeToCloseGesture = Gesture.Pan()
    .runOnJS( true )
    // While zoomed, a downward drag should pan the image, not close the viewer
    .enabled( !zooming )
    .maxPointers( 1 )
    // Activate only on a mostly-vertical downward drag
    .activeOffsetY( 15 )
    .failOffsetX( [-15, 15] )
    .onUpdate( ( { translationY, velocityY } ) => {
      if ( translationY > 50 && velocityY > 500 ) {
        // Close media viewer on swipe down
        onClose();
      }
    } );

  return (
    <View className="flex-1">
      <GestureHandlerRootView>
        <GestureDetector gesture={swipeToCloseGesture}>
          <View collapsable={false}>
            <Carousel
              key={`MediaViewerCarousel-${screenWidth}`}
              testID="MediaViewer.carousel"
              ref={horizontalScroll}
              data={items}
              renderItem={renderItem}
              defaultIndex={selectedMediaIndex}
              loop={false}
              width={screenWidth}
              // Disable scrolling when image is zooming
              enabled={!zooming}
              onSnapToItem={setSelectedMediaIndex}
              onConfigurePanGesture={onConfigurePanGesture}
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
};

export default MainMediaDisplay;
