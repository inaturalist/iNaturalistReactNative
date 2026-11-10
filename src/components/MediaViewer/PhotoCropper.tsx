import { ActivityIndicator, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useEffect, useMemo, useState } from "react";
import type { LayoutChangeEvent, ViewStyle } from "react-native";
import { Image } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import type { CropRectangle } from "sharedHelpers/getCropRectangle";
import getCropRectangle, { getMinimumCropFraction } from "sharedHelpers/getCropRectangle";
import colors from "styles/tailwindColors";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
const CORNERS: Corner[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

// GestureHandlerRootView is third-party and not registered with nativewind
const ROOT_STYLE: ViewStyle = { flex: 1 };

// Rule-of-thirds lines inside the frame
const GRIDLINE_CLASSES = [
  "left-1/3 inset-y-0 w-px",
  "left-2/3 inset-y-0 w-px",
  "top-1/3 inset-x-0 h-px",
  "top-2/3 inset-x-0 h-px",
];

// Pins a handle, and the arms of its L, to its corner of the frame. Spelled
// out in full so nativewind's build-time scan finds every class
const CORNER_CLASSES: Record<Corner, string> = {
  topLeft: "top-0 left-0",
  topRight: "top-0 right-0",
  bottomLeft: "bottom-0 left-0",
  bottomRight: "bottom-0 right-0",
};

interface Size {
  width: number;
  height: number;
}

// The crop frame, in points from the photo's top-left corner. It keeps the
// photo's aspect ratio, so its width sets its height
interface Frame {
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: SharedValue<number>;
}

interface CropHandleProps {
  corner: Corner;
  frame: Frame;
  display: Size;
  heightPerWidth: number;
  minimumWidth: number;
}

const CropHandle = ( {
  corner, frame, display, heightPerWidth, minimumWidth,
}: CropHandleProps ) => {
  const isLeft = corner === "topLeft" || corner === "bottomLeft";
  const isTop = corner === "topLeft" || corner === "topRight";
  const start = useSharedValue( { x: 0, y: 0, width: 0 } );
  const cornerClasses = CORNER_CLASSES[corner];

  const gesture = useMemo( ( ) => Gesture.Pan( )
    .withTestId( `PhotoCropper.handle.${corner}` )
    .onStart( ( ) => {
      start.set( { x: frame.x.get( ), y: frame.y.get( ), width: frame.width.get( ) } );
    } )
    .onUpdate( ( { translationX, translationY } ) => {
      const { x: startX, y: startY, width: startWidth } = start.get( );
      const startHeight = startWidth * heightPerWidth;
      // The opposite corner stays put while this one is dragged
      const anchorX = isLeft
        ? startX + startWidth
        : startX;
      const anchorY = isTop
        ? startY + startHeight
        : startY;
      // Follow the drag on both axes, keeping the photo's aspect ratio
      const widthFromX = startWidth + ( isLeft
        ? -translationX
        : translationX );
      const widthFromY = ( startHeight + ( isTop
        ? -translationY
        : translationY ) ) / heightPerWidth;
      // Stop at the photo's edges and at the minimum crop size
      const maximumWidth = Math.min(
        isLeft
          ? anchorX
          : display.width - anchorX,
        ( isTop
          ? anchorY
          : display.height - anchorY ) / heightPerWidth,
      );
      const width = Math.min(
        Math.max( ( widthFromX + widthFromY ) / 2, minimumWidth ),
        maximumWidth,
      );
      frame.width.set( width );
      frame.x.set( isLeft
        ? anchorX - width
        : anchorX );
      frame.y.set( isTop
        ? anchorY - width * heightPerWidth
        : anchorY );
    } ), [corner, display, frame, heightPerWidth, isLeft, isTop, minimumWidth, start] );

  return (
    <GestureDetector gesture={gesture}>
      {/* 44pt touch target, with a white L 22pt long and 4pt thick inside it */}
      <Animated.View className={`absolute w-11 h-11 ${cornerClasses}`}>
        <Animated.View className={`absolute w-[22px] h-1 bg-white ${cornerClasses}`} />
        <Animated.View className={`absolute w-1 h-[22px] bg-white ${cornerClasses}`} />
      </Animated.View>
    </GestureDetector>
  );
};

interface Props {
  uri: string;
  saving?: boolean;
  onCancel: ( ) => void;
  onCrop: ( cropRectangle: CropRectangle ) => void;
}

// Shows a photo with a crop frame the user resizes by dragging its corners.
// The frame keeps the photo's aspect ratio
const PhotoCropper = ( {
  uri, saving, onCancel, onCrop,
}: Props ) => {
  const [imageSize, setImageSize] = useState<Size | null>( null );
  const [containerSize, setContainerSize] = useState<Size | null>( null );
  const frameX = useSharedValue( 0 );
  const frameY = useSharedValue( 0 );
  const frameWidth = useSharedValue( 0 );
  const frame = useMemo( ( ) => ( { x: frameX, y: frameY, width: frameWidth } ), [
    frameX,
    frameY,
    frameWidth,
  ] );

  useEffect( ( ) => {
    // If the photo can't be read there is nothing to crop
    Image.getSize( uri ).then( setImageSize ).catch( onCancel );
  }, [uri, onCancel] );

  const heightPerWidth = imageSize
    ? imageSize.height / imageSize.width
    : 1;

  // The photo fitted inside the available space at its own aspect ratio
  const display = useMemo( ( ): Size | null => {
    if ( !imageSize || !containerSize ) return null;
    const width = Math.min( containerSize.width, containerSize.height / heightPerWidth );
    return { width, height: width * heightPerWidth };
  }, [containerSize, heightPerWidth, imageSize] );

  // Start with the frame around the whole photo
  useEffect( ( ) => {
    if ( !display ) return;
    frameX.set( 0 );
    frameY.set( 0 );
    frameWidth.set( display.width );
  }, [display, frameX, frameY, frameWidth] );

  const minimumWidth = imageSize && display
    ? display.width * getMinimumCropFraction( imageSize.width, imageSize.height )
    : 0;
  const dimBorderWidth = Math.max( display?.width || 0, display?.height || 0 );

  const frameStyle = useAnimatedStyle( ( ) => ( {
    left: frameX.get( ),
    top: frameY.get( ),
    width: frameWidth.get( ),
    height: frameWidth.get( ) * heightPerWidth,
  } ) );
  // Dim the photo outside the frame
  const dimStyle = useAnimatedStyle( ( ) => ( {
    left: frameX.get( ) - dimBorderWidth,
    top: frameY.get( ) - dimBorderWidth,
    width: frameWidth.get( ) + dimBorderWidth * 2,
    height: frameWidth.get( ) * heightPerWidth + dimBorderWidth * 2,
    borderWidth: dimBorderWidth,
  } ) );

  const onLayout = ( { nativeEvent }: LayoutChangeEvent ) => {
    const { width, height } = nativeEvent.layout;
    setContainerSize( { width, height } );
  };

  const confirmCrop = ( ) => {
    if ( !imageSize || !display ) return;
    const cropRectangle = getCropRectangle( {
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      displayWidth: display.width,
      frame: { x: frameX.get( ), y: frameY.get( ), width: frameWidth.get( ) },
    } );
    const coversWholePhoto = cropRectangle.endX - cropRectangle.startX === imageSize.width
      && cropRectangle.endY - cropRectangle.startY === imageSize.height;
    // Nothing to crop, so don't write a copy of the same photo
    if ( coversWholePhoto ) {
      onCancel( );
      return;
    }
    onCrop( cropRectangle );
  };

  return (
    <GestureHandlerRootView style={ROOT_STYLE}>
      <View
        className="flex-1 items-center justify-center"
        onLayout={onLayout}
        testID="PhotoCropper"
      >
        {display && imageSize && (
          <View className="overflow-hidden" style={display}>
            <Image
              source={{ uri }}
              style={display}
              accessibilityIgnoresInvertColors
            />
            <Animated.View className="absolute border-black/60" style={dimStyle} />
            <Animated.View className="absolute border border-white" style={frameStyle}>
              {GRIDLINE_CLASSES.map( gridlineClasses => (
                <Animated.View
                  key={gridlineClasses}
                  className={`absolute bg-white/50 ${gridlineClasses}`}
                />
              ) )}
              {CORNERS.map( corner => (
                <CropHandle
                  key={corner}
                  corner={corner}
                  frame={frame}
                  display={display}
                  heightPerWidth={heightPerWidth}
                  minimumWidth={minimumWidth}
                />
              ) )}
            </Animated.View>
          </View>
        )}
      </View>
      <View className="flex-row justify-between items-center px-4 py-4">
        <INatIconButton
          icon="close"
          color={colors.white}
          size={22}
          width={50}
          height={50}
          accessibilityLabel="Cancel crop"
          onPress={onCancel}
          disabled={saving}
        />
        {saving
          ? <ActivityIndicator size={50} />
          : (
            <INatIconButton
              icon="check"
              mode="contained"
              backgroundColor={colors.inatGreen}
              color={colors.white}
              size={22}
              width={50}
              height={50}
              accessibilityLabel="Save crop"
              onPress={confirmCrop}
              disabled={!display}
            />
          )}
      </View>
    </GestureHandlerRootView>
  );
};

export default PhotoCropper;
