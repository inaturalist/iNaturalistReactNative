import { ActivityIndicator, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import type { LayoutChangeEvent, ViewStyle } from "react-native";
import { Image } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { CropZoomRefType, CropZoomState } from "react-native-zoom-toolkit";
import { CropZoom } from "react-native-zoom-toolkit";
import fitCropFrame from "sharedHelpers/fitCropFrame";
import type { CropRectangle } from "sharedHelpers/getCropRectangle";
import getCropRectangle, {
  getMinimumCropFraction,
  getVisibleArea,
  MINIMUM_CROP_SIZE,
} from "sharedHelpers/getCropRectangle";
import colors from "styles/tailwindColors";

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
const CORNERS: Corner[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

// Smallest the frame can get on screen, so its corners stay easy to grab. To
// crop tighter than this shows, zoom in first
const MINIMUM_FRAME_SIZE = 88;

// GestureHandlerRootView is third-party and not registered with nativewind
const ROOT_STYLE: ViewStyle = { flex: 1 };
const PHOTO_STYLE = { width: "100%", height: "100%" } as const;

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

// The crop frame, in points from the crop area's top-left corner. It can be
// any shape
interface Frame {
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
}

interface CropHandleProps {
  corner: Corner;
  frame: Frame;
  area: Size;
  // The frame's smallest size for the minimum crop, in points, when the
  // photo isn't zoomed
  minimumUnzoomed: Size;
  // How far the photo is zoomed in. Zooming in makes each point cover fewer
  // pixels, so the frame's smallest size in points grows with it
  zoom: SharedValue<number>;
  onRelease: ( ) => void;
}

const CropHandle = ( {
  corner, frame, area, minimumUnzoomed, zoom, onRelease,
}: CropHandleProps ) => {
  const isLeft = corner === "topLeft" || corner === "bottomLeft";
  const isTop = corner === "topLeft" || corner === "topRight";
  const start = useSharedValue( {
    x: 0, y: 0, width: 0, height: 0,
  } );
  const cornerClasses = CORNER_CLASSES[corner];

  const gesture = useMemo( ( ) => Gesture.Pan( )
    .withTestId( `PhotoCropper.handle.${corner}` )
    .onStart( ( ) => {
      start.set( {
        x: frame.x.get( ),
        y: frame.y.get( ),
        width: frame.width.get( ),
        height: frame.height.get( ),
      } );
    } )
    .onUpdate( ( { translationX, translationY } ) => {
      const {
        x: startX, y: startY, width: startWidth, height: startHeight,
      } = start.get( );
      // The opposite corner stays put while this one is dragged
      const anchorX = isLeft
        ? startX + startWidth
        : startX;
      const anchorY = isTop
        ? startY + startHeight
        : startY;
      // Each side follows the drag on its own axis, so the frame can take
      // any shape. It stops at the crop area's edges and the minimum size
      const maximumWidth = isLeft
        ? anchorX
        : area.width - anchorX;
      const maximumHeight = isTop
        ? anchorY
        : area.height - anchorY;
      const minimumWidth = Math.min(
        Math.max( minimumUnzoomed.width * zoom.get( ), MINIMUM_FRAME_SIZE ),
        maximumWidth,
      );
      const minimumHeight = Math.min(
        Math.max( minimumUnzoomed.height * zoom.get( ), MINIMUM_FRAME_SIZE ),
        maximumHeight,
      );
      const width = Math.min(
        Math.max( startWidth + ( isLeft
          ? -translationX
          : translationX ), minimumWidth ),
        maximumWidth,
      );
      const height = Math.min(
        Math.max( startHeight + ( isTop
          ? -translationY
          : translationY ), minimumHeight ),
        maximumHeight,
      );
      frame.width.set( width );
      frame.height.set( height );
      frame.x.set( isLeft
        ? anchorX - width
        : anchorX );
      frame.y.set( isTop
        ? anchorY - height
        : anchorY );
    } )
    .onEnd( ( ) => {
      scheduleOnRN( onRelease );
    } ), [area, corner, frame, isLeft, isTop, minimumUnzoomed, onRelease, start, zoom] );

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

// Spike: shows a photo people can pinch to zoom and drag to pan, using
// react-native-zoom-toolkit's CropZoom, under a crop frame of any shape that
// they resize by dragging its corners. CropZoom's own crop area stays the
// size of the whole photo; the frame is our own, drawn on top of it
const PhotoCropper = ( {
  uri, saving, onCancel, onCrop,
}: Props ) => {
  const [imageSize, setImageSize] = useState<Size | null>( null );
  const [containerSize, setContainerSize] = useState<Size | null>( null );
  const cropZoomRef = useRef<CropZoomRefType>( null );
  const zoom = useSharedValue( 1 );
  const frameX = useSharedValue( 0 );
  const frameY = useSharedValue( 0 );
  const frameWidth = useSharedValue( 0 );
  const frameHeight = useSharedValue( 0 );
  const frame = useMemo( ( ) => ( {
    x: frameX, y: frameY, width: frameWidth, height: frameHeight,
  } ), [frameX, frameY, frameWidth, frameHeight] );

  useEffect( ( ) => {
    // If the photo can't be read there is nothing to crop
    Image.getSize( uri ).then( setImageSize ).catch( onCancel );
  }, [uri, onCancel] );

  // The crop area: the photo fitted inside the available space at its own
  // aspect ratio
  const area = useMemo( ( ): Size | null => {
    if ( !imageSize || !containerSize ) return null;
    const heightPerWidth = imageSize.height / imageSize.width;
    const width = Math.min( containerSize.width, containerSize.height / heightPerWidth );
    return { width, height: width * heightPerWidth };
  }, [containerSize, imageSize] );

  // Start with the frame around the whole photo
  useEffect( ( ) => {
    if ( !area ) return;
    frameX.set( 0 );
    frameY.set( 0 );
    frameWidth.set( area.width );
    frameHeight.set( area.height );
  }, [area, frameX, frameY, frameWidth, frameHeight] );

  const minimumUnzoomed = useMemo( ( ): Size => ( imageSize && area
    ? {
      width: area.width * getMinimumCropFraction( imageSize.width ),
      height: area.height * getMinimumCropFraction( imageSize.height ),
    }
    : { width: 0, height: 0 } ), [area, imageSize] );

  // Zooms in until the frame, filling the crop area, shows the minimum crop
  // along the photo's shorter side, and no further. CropZoom's own limit
  // stops at 1 pixel per point, too soon on most phones for a 250px crop
  const maxScale = imageSize
    ? Math.max( 1, Math.min( imageSize.width, imageSize.height ) / MINIMUM_CROP_SIZE )
    : 1;

  const trackZoom = useCallback( ( state: CropZoomState<number> ) => {
    "worklet";

    zoom.set( state.scale );
  }, [zoom] );

  // Once a corner is let go, the frame grows to fill the crop area and the
  // photo zooms with it, so the part of the photo in the frame stays the same
  const fillCropArea = useCallback( ( ) => {
    const cropZoom = cropZoomRef.current;
    if ( !cropZoom || !area ) return;
    const state = cropZoom.getState( );
    const fitted = fitCropFrame( {
      frame: {
        x: frameX.get( ),
        y: frameY.get( ),
        width: frameWidth.get( ),
        height: frameHeight.get( ),
      },
      area,
      transform: state,
      maxScale: state.maxScale,
    } );
    // CropZoom animates with withTiming's defaults, so the frame does too.
    // Moving on the same curve keeps the photo lined up with the frame
    frameX.set( withTiming( fitted.frame.x ) );
    frameY.set( withTiming( fitted.frame.y ) );
    frameWidth.set( withTiming( fitted.frame.width ) );
    frameHeight.set( withTiming( fitted.frame.height ) );
    cropZoom.setTransformState( {
      ...fitted.transform,
      rotate: state.rotate,
      rotateX: state.rotateX,
      rotateY: state.rotateY,
    } );
  }, [area, frameX, frameY, frameWidth, frameHeight] );

  const areaWidth = area?.width || 0;
  const areaHeight = area?.height || 0;
  const dimBorderWidth = Math.max( areaWidth, areaHeight );

  const frameStyle = useAnimatedStyle( ( ) => ( {
    left: frameX.get( ),
    top: frameY.get( ),
    width: frameWidth.get( ),
    height: frameHeight.get( ),
  } ) );
  // Dim the photo outside the frame
  const dimStyle = useAnimatedStyle( ( ) => ( {
    left: frameX.get( ) - dimBorderWidth,
    top: frameY.get( ) - dimBorderWidth,
    width: frameWidth.get( ) + dimBorderWidth * 2,
    height: frameHeight.get( ) + dimBorderWidth * 2,
    borderWidth: dimBorderWidth,
  } ) );

  const onLayout = ( { nativeEvent }: LayoutChangeEvent ) => {
    const { width, height } = nativeEvent.layout;
    setContainerSize( { width, height } );
  };

  const confirmCrop = ( ) => {
    const cropZoom = cropZoomRef.current;
    if ( !imageSize || !area || !cropZoom ) return;
    const { scale, translateX, translateY } = cropZoom.getState( );
    const visibleArea = getVisibleArea( {
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      areaWidth: area.width,
      areaHeight: area.height,
      scale,
      translateX,
      translateY,
    } );
    const cropRectangle = getCropRectangle( {
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      areaWidth: area.width,
      areaHeight: area.height,
      visibleArea,
      frame: {
        x: frameX.get( ),
        y: frameY.get( ),
        width: frameWidth.get( ),
        height: frameHeight.get( ),
      },
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
        {area && imageSize && (
          <View className="overflow-hidden" style={area}>
            <CropZoom
              ref={cropZoomRef}
              cropSize={area}
              resolution={imageSize}
              maxScale={maxScale}
              // Keep the photo covering the whole crop area, and so the frame
              panMode="clamp"
              onUpdate={trackZoom}
            >
              <Image
                source={{ uri }}
                style={PHOTO_STYLE}
                accessibilityIgnoresInvertColors
              />
            </CropZoom>
            {/* Touches pass through everything here but the corner handles, so
                pinching and dragging inside the frame zooms and pans the photo */}
            <View className="absolute inset-0" pointerEvents="box-none">
              <Animated.View
                className="absolute border-black/60"
                style={dimStyle}
                pointerEvents="none"
              />
              <Animated.View
                className="absolute border border-white"
                style={frameStyle}
                pointerEvents="box-none"
              >
                {GRIDLINE_CLASSES.map( gridlineClasses => (
                  <Animated.View
                    key={gridlineClasses}
                    className={`absolute bg-white/50 ${gridlineClasses}`}
                    pointerEvents="none"
                  />
                ) )}
                {CORNERS.map( corner => (
                  <CropHandle
                    key={corner}
                    corner={corner}
                    frame={frame}
                    area={area}
                    minimumUnzoomed={minimumUnzoomed}
                    zoom={zoom}
                    onRelease={fillCropArea}
                  />
                ) )}
              </Animated.View>
            </View>
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
              disabled={!area}
            />
          )}
      </View>
    </GestureHandlerRootView>
  );
};

export default PhotoCropper;
