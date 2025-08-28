import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { ActivityIndicator, INatIconButton } from "components/SharedComponents";
import { ImageBackground, Pressable, View } from "components/styledComponents";
import React, {
  useCallback, useRef, useState
} from "react";
import {
  FlatList
} from "react-native";
import Modal from "react-native-modal";
import {
  type SharedValue
} from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

interface Props {
  takingPhoto?: boolean;
  isLandscapeMode?: boolean;
  isLargeScreen?: boolean;
  isTablet?: boolean;
  rotation?: SharedValue<number>;
  photoUris: string[];
  onDelete: ( _uri: string ) => void;
}

export const SMALL_PHOTO_DIM = 42;
export const LARGE_PHOTO_DIM = 83;
export const SMALL_PHOTO_GUTTER = 6;
export const LARGE_PHOTO_GUTTER = 17;
const IMAGE_CONTAINER_CLASSES = ["justify-center", "items-center"] as const;
const SMALL_PHOTO_CLASSES = [
  "rounded-sm",
  "w-[42px]",
  "h-[42x]",
  "mx-[3px]"
] as const;
const LARGE_PHOTO_CLASSES = [
  "rounded-md",
  "w-[83px]",
  "h-[83px]",
  "m-[8.5px]"
] as const;

const PhotoCarousel = ( {
  takingPhoto,
  isLandscapeMode,
  isLargeScreen,
  isTablet,
  rotation,
  photoUris,
  onDelete
}: Props ) => {
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const { t } = useTranslation( );
  const [deletePhotoMode, setDeletePhotoMode] = useState( false );
  const [tappedPhotoIndex, setTappedPhotoIndex] = useState( -1 );
  const photoClasses = isLargeScreen
    ? LARGE_PHOTO_CLASSES
    : SMALL_PHOTO_CLASSES;
  const photoDim = isLargeScreen
    ? LARGE_PHOTO_DIM
    : SMALL_PHOTO_DIM;
  const photoGutter = isLargeScreen
    ? LARGE_PHOTO_GUTTER
    : SMALL_PHOTO_GUTTER;

  // I tried passing this in as a prop but the animation wasn't as smooth
  const animatedStyle = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: rotation
            ? withTiming( `${-1 * rotation.get( )}deg` )
            : "0"
        }
      ]
    } )
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
          <ActivityIndicator size={25} />
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
    if ( deletePhotoFromObservation ) {
      setDeletePhotoMode( mode => !mode );
    }
  }, [deletePhotoFromObservation] );

  const viewPhotoAtIndex = useCallback( ( index: number ) => {
    setTappedPhotoIndex( index );
  }, [
    setTappedPhotoIndex
  ] );

  const renderPhotoOrEvidenceButton = useCallback( ( {
    item: photoUri,
    index
  } ) => (
    <>
      {index === 0 && renderSkeleton( )}
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
              source={{ uri: photoUri }}
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
                        color={colors.white}
                        backgroundColor="rgba(0, 0, 0, 0.5)"
                        testID={`PhotoCarousel.deletePhoto.${photoUri}`}
                        accessibilityLabel={t( "Delete-photo" )}
                        onPress={( ) => {
                          onDelete( photoUri );
                          if ( photoUris.length === 1 && deletePhotoMode ) {
                            setDeletePhotoMode( false );
                          }
                        }}
                      />
                    </View>
                  )
                  : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t( "View-photo" )}
                      testID={`PhotoCarousel.displayPhoto.${photoUri}`}
                      onLongPress={showDeletePhotoMode}
                      onPress={( ) => viewPhotoAtIndex( index )}
                      className="w-full h-full"
                    />
                  )
              }
            </ImageBackground>
          </View>
        </View>
      </Animated.View>
    </>
  ), [
    animatedStyle,
    onDelete,
    deletePhotoMode,
    isTablet,
    photoClasses,
    photoUris.length,
    renderSkeleton,
    showDeletePhotoMode,
    t,
    viewPhotoAtIndex
  ] );

  const photoPreviewsList = (
    <FlatList
      data={[...photoUris]}
      renderItem={renderPhotoOrEvidenceButton}
      horizontal={!isTablet || !isLandscapeMode}
      ListEmptyComponent={takingPhoto
        ? renderSkeleton( )
        : null}
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

  const containerRef = useRef<View>( undefined );
  const [containerPos, setContainerPos] = useState<{
    x: number | null;
    y: number | null;
    w?: number;
    h?: number;
  }>( { x: null, y: null } );
  const containerStyle = {
    height: isTablet && isLandscapeMode
      ? photoUris.length * ( photoDim + photoGutter ) + photoGutter
      : photoDim + ( photoGutter * 2 ),
    padding: photoGutter / 2
  };

  return (
    <View
      ref={containerRef}
      onLayout={
        // When the container gets rendered, we store its position on screen
        // in state so we can lay out content inside the modal in exactly the
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
              style={{ margin: 0, position: "relative" }}
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
      <MediaViewerModal
        editable
        showModal={tappedPhotoIndex >= 0}
        onClose={( ) => setTappedPhotoIndex( -1 )}
        onDeletePhoto={async ( photoUri: string ) => {
          await onDelete( photoUri );
          setTappedPhotoIndex( tappedPhotoIndex - 1 );
        }}
        uri={photoUris[tappedPhotoIndex]}
        photos={photoUris.map( uri => ( { url: uri } ) )}
      />
    </View>
  );
};

export default PhotoCarousel;
