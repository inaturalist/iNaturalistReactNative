// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { ImageBackground, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import {
  ActivityIndicator,
  FlatList
} from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

type Props = {
  emptyComponent?: Function,
  takingPhoto?: boolean,
  deletePhoto?: Function,
  isLandscapeMode?:boolean,
  isLargeScreen?: boolean,
  isTablet?: boolean,
  rotation?: {
    value: number
  },
  setPhotoEvidenceUris: Function,
  photoUris: Array<string>
}

export const SMALL_PHOTO_DIM = 42;
export const LARGE_PHOTO_DIM = 83;
export const SMALL_PHOTO_GUTTER = 6;
export const LARGE_PHOTO_GUTTER = 17;
const IMAGE_CONTAINER_CLASSES = ["justify-center", "items-center"];
const SMALL_PHOTO_CLASSES = [
  "rounded-sm",
  "w-[42px]",
  "h-[42x]",
  "mx-[3px]"
];
const LARGE_PHOTO_CLASSES = [
  "rounded-md",
  "w-[83px]",
  "h-[83px]",
  "m-[8.5px]"
];

const PhotoCarousel = ( {
  emptyComponent,
  takingPhoto,
  deletePhoto,
  isLandscapeMode,
  isLargeScreen,
  isTablet,
  rotation,
  setPhotoEvidenceUris,
  photoUris
}: Props ): Node => {
  const { t } = useTranslation( );
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

  const renderSkeleton = useCallback( ( ) => ( takingPhoto
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
    : null ), [
    isTablet,
    isLandscapeMode,
    photoClasses,
    takingPhoto
  ] );

  const showDeletePhotoMode = useCallback( ( ) => {
    if ( deletePhoto ) {
      setDeletePhotoMode( mode => !mode );
    }
  }, [deletePhoto] );

  const viewPhotoAtIndex = useCallback( ( item, index ) => {
    setPhotoEvidenceUris( [...photoUris] );
    navigation.navigate( "MediaViewer", { index } );
  }, [
    setPhotoEvidenceUris,
    navigation,
    photoUris
  ] );

  const deletePhotoAtIndex = useCallback( ( item, _index ) => {
    if ( !deletePhoto ) return;
    deletePhoto( item );
  }, [deletePhoto] );

  const renderPhotoOrEvidenceButton = useCallback( ( { item, index } ) => (
    <>
      <Animated.View style={!isTablet && animatedStyle}>
        <View
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
              {
                deletePhotoMode
                  ? (
                    <View
                      className="w-full h-full flex-1 justify-center items-center bg-black/50"
                    >
                      <INatIconButton
                        icon="trash-outline"
                        mode="contained"
                        color={theme.colors.onPrimary}
                        backgroundColor="rgba(0, 0, 0, 0.5)"
                        accessibilityLabel={t( "Delete-photo" )}
                        onPress={( ) => deletePhotoAtIndex( item, index )}
                      />
                    </View>
                  )
                  : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t( "View-photo" )}
                      onLongPress={showDeletePhotoMode}
                      onPress={( ) => viewPhotoAtIndex( item, index )}
                      className="w-full h-full"
                    />
                  )
              }
            </ImageBackground>
          </View>
        </View>
      </Animated.View>
      {index === photoUris.length - 1 && renderSkeleton( )}
    </>
  ), [
    animatedStyle,
    deletePhotoAtIndex,
    deletePhotoMode,
    isTablet,
    photoClasses,
    photoUris,
    renderSkeleton,
    showDeletePhotoMode,
    t,
    theme,
    viewPhotoAtIndex
  ] );

  const photoPreviewsList = (
    <FlatList
      data={[...photoUris]}
      renderItem={renderPhotoOrEvidenceButton}
      horizontal={!isTablet || !isLandscapeMode}
      ListEmptyComponent={takingPhoto
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
    height: isTablet && isLandscapeMode
      ? containerPos.h
      : photoDim + photoGutter * 2,
    padding: photoGutter / 2
  };

  return (
    <View
      ref={containerRef}
      onLayout={
        // When the container gets rendered, we store its position on screen
        // in state so we can layout content inside the modal in exactly the
        // same position
        ( ) => containerRef?.current?.measure(
          ( _x, _y, w, h, pageX, pageY ) => setContainerPos( {
            x: pageX,
            y: pageY,
            w,
            h
          } )
        )
      }
      // Dynamic calculation of these values kind of just doesn't work with tailwind.
      // eslint-disable-next-line react-native/no-inline-styles
      style={containerStyle}
    >
      {
        // Render a model version of the previews over the actual previews.
        // Awkward, but it helps handle some weird styling in a landscape
        // tablet
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
