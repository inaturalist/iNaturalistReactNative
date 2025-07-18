// @flow

import SoundContainer from "components/ObsDetails/SoundContainer";
import {
  TransparentCircleButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useMemo, useRef, useState
} from "react";
import { FlatList } from "react-native";
import {
  GestureHandlerRootView,
  NativeViewGestureHandler,
  PanGestureHandler
} from "react-native-gesture-handler";
import Photo from "realmModels/Photo.ts";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";
import useTranslation from "sharedHooks/useTranslation.ts";
import colors from "styles/tailwindColors";

import AttributionButton from "./AttributionButton";
import CustomImageZoom from "./CustomImageZoom";

type Props = {
  autoPlaySound?: boolean, // automatically start playing a sound when it is visible
  editable?: boolean,
  // $FlowIgnore
  horizontalScroll: unknown,
  onDeletePhoto?: Function,
  onClose?: Function,
  onDeleteSound?: Function,
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  sounds?: Array<{
    file_url: string
  }>,
  selectedMediaIndex: number,
  setSelectedMediaIndex: Function
}

const MainMediaDisplay = ( {
  autoPlaySound,
  editable,
  horizontalScroll,
  onDeletePhoto = ( ) => undefined,
  onDeleteSound = ( ) => undefined,
  onClose = ( ) => undefined,
  photos,
  sounds = [],
  selectedMediaIndex,
  setSelectedMediaIndex
}: Props ): Node => {
  const { t } = useTranslation( );
  const panRef = useRef();
  const listRef = useRef();
  const { screenWidth } = useDeviceOrientation( );
  const [displayHeight, setDisplayHeight] = useState( 0 );
  const [zooming, setZooming] = useState( false );
  const atFirstItem = selectedMediaIndex === 0;
  const items = useMemo( ( ) => ( [
    ...photos.map( photo => ( { ...photo, type: "photo" } ) ),
    ...sounds.map( sound => ( { ...sound, type: "sound" } ) )
  ] ), [photos, sounds] );
  const atLastItem = selectedMediaIndex === items.length - 1;

  // t changes a lot, but these strings don't, so using them as useCallback
  // dependencies keeps that method from getting redefined a lot
  const deletePhotoLabel = t( "Delete-photo" );
  const deleteSoundLabel = t( "Delete-sound" );

  const renderPhoto = useCallback( photo => {
    const uri = Photo.displayLocalOrRemoteLargePhoto( photo );
    const hasAttribution = photo?.attribution;
    return (
      <View>
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
                    || photo.url
                  )}
                  icon="trash-outline"
                  color={colors.white}
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
  }, [
    deletePhotoLabel,
    editable,
    onDeletePhoto,
    selectedMediaIndex
  ] );

  const renderSound = useCallback( sound => (
    <View
      className="justify-center items-center"
      style={{
        width: screenWidth,
        height: displayHeight
      }}
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
              color={colors.white}
              accessibilityLabel={deleteSoundLabel}
            />
          </View>
        )
      }
    </View>
  ), [
    autoPlaySound,
    deleteSoundLabel,
    displayHeight,
    editable,
    items,
    onDeleteSound,
    screenWidth,
    selectedMediaIndex
  ] );

  const renderItem = useCallback( ( { item } ) => (
    item.type === "photo"
      ? renderPhoto( item )
      : renderSound( item )
  ), [
    renderPhoto,
    renderSound
  ] );

  // need getItemLayout for setting initial scroll index
  const getItemLayout = useCallback( ( data, idx ) => ( {
    length: screenWidth,
    offset: screenWidth * idx,
    index: idx
  } ), [screenWidth] );

  const handleScrollLeft = useCallback( index => {
    if ( atFirstItem ) { return; }
    setSelectedMediaIndex( index );
  }, [atFirstItem, setSelectedMediaIndex] );

  const handleScrollRight = useCallback( index => {
    if ( atLastItem ) { return; }
    setSelectedMediaIndex( index );
  }, [atLastItem, setSelectedMediaIndex] );

  const handleScrollEndDrag = useCallback( e => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = screenWidth * selectedMediaIndex;

    // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
    const index = Math.floor(
      Math.floor( x ) / Math.floor( layoutMeasurement.width )
    );

    if ( x > currentOffset ) {
      handleScrollRight( index );
    } else if ( x < currentOffset ) {
      handleScrollLeft( index );
    }
  }, [
    handleScrollLeft,
    handleScrollRight,
    screenWidth,
    selectedMediaIndex
  ] );

  const onGestureEvent = useCallback( event => {
    const { translationY, velocityY } = event.nativeEvent;

    if ( translationY > 50 && velocityY > 500 ) {
      // Close media viewer on swipe up
      onClose();
    }
  }, [onClose] );

  return (
    <View
      className="flex-1"
      onLayout={event => {
        const { height } = event.nativeEvent.layout;
        setDisplayHeight( height );
      }}
    >
      <GestureHandlerRootView>
        <PanGestureHandler
          ref={panRef}
          simultaneousHandlers={listRef}
          onGestureEvent={onGestureEvent}
        >
          <NativeViewGestureHandler ref={listRef} simultaneousHandlers={panRef}>
            <FlatList
              data={items}
              renderItem={renderItem}
              initialScrollIndex={selectedMediaIndex}
              getItemLayout={getItemLayout}
              horizontal
              pagingEnabled
              // Disable scrolling when image is zooming
              scrollEnabled={!zooming}
              showsHorizontalScrollIndicator={false}
              ref={horizontalScroll}
              onMomentumScrollEnd={handleScrollEndDrag}
            />
          </NativeViewGestureHandler>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
};

export default MainMediaDisplay;
