// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { ImageBackground, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Modal from "react-native-modal";
import { IconButton, useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated";

type Props = {
  emptyComponent?: Function,
  savingPhoto?: boolean,
  deletePhoto?: Function,
  isLandscapeMode?:boolean,
  isLargeScreen?: boolean,
  isTablet?: boolean,
  rotation?: {
    value: number
  },
  setMediaViewerUris: Function,
  photoUris: Array<string>,
  setSelectedPhotoIndex: Function
}

export const SMALL_PHOTO_DIM = 42;
export const LARGE_PHOTO_DIM = 83;
export const SMALL_PHOTO_GUTTER = 6;
export const LARGE_PHOTO_GUTTER = 17;
const IMAGE_CONTAINER_CLASSES = ["justify-center", "items-center"];
const SMALL_PHOTO_CLASSES = [
  "rounded-sm",
  `w-[${SMALL_PHOTO_DIM}px]`,
  `h-[${SMALL_PHOTO_DIM}px]`,
  `m-[${SMALL_PHOTO_GUTTER / 2}px]`
];
const LARGE_PHOTO_CLASSES = [
  "rounded-md",
  `w-[${LARGE_PHOTO_DIM}px]`,
  `h-[${LARGE_PHOTO_DIM}px]`,
  `m-[${LARGE_PHOTO_GUTTER / 2}px]`
];

const PhotoCarousel = ( {
  emptyComponent,
  savingPhoto,
  deletePhoto,
  isLandscapeMode,
  isLargeScreen,
  isTablet,
  rotation,
  setMediaViewerUris,
  photoUris,
  setSelectedPhotoIndex
}: Props ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const [deletePhotoMode, setDeletePhotoMode] = useState( false );
  const photoClasses = isLargeScreen
    ? LARGE_PHOTO_CLASSES
    : SMALL_PHOTO_CLASSES;
  const photoDim = isLargeScreen
    ? LARGE_PHOTO_DIM
    : SMALL_PHOTO_DIM;
  const photoGutter = isLargeScreen
    ? LARGE_PHOTO_GUTTER
    : SMALL_PHOTO_GUTTER;

  useEffect( () => {
    if ( photoUris.length === 0 && deletePhotoMode ) {
      setDeletePhotoMode( false );
    }
  }, [photoUris.length, deletePhotoMode] );

  // I tried passing this in as a prop but the animation wasn't as smooth
  const animatedStyle = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: rotation
            ? withTiming( `${-1 * rotation.value}deg` )
            : 0
        }
      ]
    } ),
    [rotation?.value]
  );

  const renderSkeleton = ( ) => ( savingPhoto
    ? (
      <View
        className={classnames(
          "flex",
          {
            "w-fit h-full": isTablet && isLandscapeMode
          },
          ...IMAGE_CONTAINER_CLASSES
        )}
      >
        <View
          className={classnames(
            "bg-lightGray justify-center",
            ...photoClasses
          )}
        >
          <ActivityIndicator />
        </View>
      </View>
    )
    : null );

  const renderPhotoOrEvidenceButton = ( { item, index } ) => (
    <>
      <Animated.View style={!isTablet && animatedStyle}>
        <Pressable
          accessibilityRole="button"
          onLongPress={( ) => {
            if ( deletePhoto ) {
              setDeletePhotoMode( mode => !mode );
            }
          }}
          onPress={( ) => {
            if ( deletePhotoMode && deletePhoto ) {
              deletePhoto( item );
            } else {
              setSelectedPhotoIndex( index );
              setMediaViewerUris( [...photoUris] );
              navigation.navigate( "MediaViewer" );
            }
          }}
          className={classnames( IMAGE_CONTAINER_CLASSES )}
        >
          <View
            testID="PhotoCarousel.photo"
            className={classnames(
              "overflow-hidden",
              ...photoClasses
            )}
          >
            <ImageBackground
              source={{ uri: item }}
              className={classnames(
                "w-fit",
                "h-full",
                "flex",
                ...IMAGE_CONTAINER_CLASSES
              )}
            >
              {deletePhotoMode && (
                <LinearGradient
                  className="absolute inset-0"
                  colors={["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.5)"]}
                />
              )}
              { deletePhotoMode && (
                <IconButton
                  icon="trash-outline"
                  mode="contained-tonal"
                  iconColor={theme.colors.onPrimary}
                  containerColor="rgba(0, 0, 0, 0.5)"
                />
              )}
            </ImageBackground>
          </View>
        </Pressable>
      </Animated.View>
      {index === photoUris.length - 1 && renderSkeleton( )}
    </>
  );

  const photoPreviewsList = (
    <FlatList
      data={[...photoUris]}
      renderItem={renderPhotoOrEvidenceButton}
      horizontal={!isTablet || !!isLandscapeMode}
      ListEmptyComponent={savingPhoto
        ? renderSkeleton( )
        : emptyComponent}
    />
  );

  // Mild acrobatics to position the photos in delete mode inside a modal
  // exactly the same place they appear normally. The modal is useful to,
  // well, behave like a modal, because in delete mode you can only delete or
  // exit delete moda, and taps outside the photos exit delete mode. But the
  // modal exists outside the normal view hierarchy so you can't position
  // things relative to containing components. Instead, we're using a ref and
  // the measure() method to store the position of the container element in
  // state, and use that to position another container inside the modal in
  // exactly the same place
  const containerRef = useRef( );
  const [containerPos, setContainerPos] = useState( { x: null, y: null } );
  const containerStyle = {
    height: isTablet && !isLandscapeMode
      ? "auto"
      : photoDim + photoGutter * 2,
    paddingTop: photoGutter,
    paddingBottom: photoGutter,
    paddingLeft: photoGutter / 2,
    paddingRight: photoGutter / 2
  };

  return (
    <View
      ref={containerRef}
      onLayout={
        // When the container gets rendered, we store its position on screen
        // in state so we can layout content inside the modal in exactly the
        // same position
        ( ) => containerRef?.current?.measure(
          ( _x, _y, _w, _h, pageX, pageY ) => setContainerPos( { x: pageX, y: pageY } )
        )
      }
      // Dynamic calculation of these values kind of just doesn't work with tailwind.
      // eslint-disable-next-line react-native/no-inline-styles
      style={containerStyle}
    >
      {
        deletePhotoMode
          ? (
            <Modal
              visible
              onBackdropPress={() => setDeletePhotoMode( false )}
              backdropOpacity={0}
              // We want this to take over the whole screen
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ margin: 0 }}
              statusBarTranslucent
            >
              <View
                // These layout values need to be dynamic relative to the
                // position of the container outside of the modal
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  position: "absolute",
                  left: containerPos.x,
                  top: containerPos.y,
                  ...containerStyle
                }}
              >
                { photoPreviewsList }
              </View>
            </Modal>
          )
          : photoPreviewsList
      }
    </View>
  );
};

export default PhotoCarousel;
