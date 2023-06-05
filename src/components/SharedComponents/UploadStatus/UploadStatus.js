// @flow

import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect } from "react";
import CircularProgressBase from "react-native-circular-progress-indicator";
import { IconButton, useTheme } from "react-native-paper";
import Reanimated, {
  cancelAnimation,
  Easing, FadeIn, interpolate,
  Keyframe, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat,
  withTiming
} from "react-native-reanimated";

type Props = {
  color?: string,
  completeColor?: string,
  progress: number,
  startSingleUpload: Function,
  layout: string,
  children: any
}
const AnimatedView = Reanimated.createAnimatedComponent( View );

const keyframe = new Keyframe( {
  // $FlowIgnore
  0: {
    opacity: 0
  },
  // $FlowIgnore
  40: {
    opacity: 1
  },
  // $FlowIgnore
  100: {
    opacity: 0
  }
} );

const UploadStatus = ( {
  color,
  completeColor,
  progress,
  startSingleUpload,
  layout,
  children
}: Props ): Node => {
  const theme = useTheme();
  const defaultColor = theme.colors.primary;
  const defaultCompleteColor = theme.colors.secondary;
  const animation = useSharedValue( 0 );
  const rotation = useDerivedValue( () => interpolate(
    animation.value,
    [0, 1],
    [0, 360]
  ) );
  const rotate = useAnimatedStyle( () => ( {
    transform: [
      {
        rotateZ: `${rotation.value}deg`
      }
    ]
  } ), [rotation.value] );

  const startAnimation = () => {
    animation.value = withRepeat(
      withTiming( 1, {
        duration: 10000,
        easing: Easing.linear
      } ),
      -1
    );
  };

  const translationParams = {
    uploadProgress: progress * 100
  };

  const accessibilityLabelText = () => {
    if ( progress < 0.05 ) {
      return t( "Saved-Observation" );
    }
    if ( progress < 1 ) {
      return t( "Upload-Progress", translationParams );
    }
    return t( "Upload-Complete" );
  };

  const startUpload = () => {
    startAnimation();
    startSingleUpload();
  };

  useEffect( () => () => cancelAnimation( rotation ), [rotation] );

  const displayIcon = () => {
    if ( progress === 0 ) {
      return (
        <IconButton
          icon="upload-saved"
          iconColor={color || defaultColor}
          size={33}
          onPress={startUpload}
          disabled={false}
          accessibilityState={{ disabled: false }}
        />
      );
    }
    if ( progress <= 0.05 ) {
      return (
        <>
          <View className="absolute">
            <INatIcon
              name="upload-arrow"
              color={color || defaultColor}
              size={15}
            />
          </View>
          <AnimatedView style={rotate}>
            <INatIcon name="circle-dots" color={color || defaultColor} size={33} />
          </AnimatedView>
        </>
      );
    }
    if ( progress > 0.05 && progress < 1 ) {
      return (
        <>
          <View className="absolute">
            <INatIcon
              name="upload-arrow"
              color={color || defaultColor}
              size={15}
            />
          </View>
          <CircularProgressBase
            testID="UploadStatus.CircularProgress"
            value={progress}
            radius={18}
            activeStrokeColor={
              progress < 1
                ? color || defaultColor
                : completeColor || defaultCompleteColor
            }
            showProgressValue={false}
            maxValue={1}
            inActiveStrokeOpacity={0}
            activeStrokeWidth={2}
          />
        </>
      );
    }
    return (
      <>
        <AnimatedView
          className="absolute"
          entering={keyframe.duration( 2000 )}
        >
          <INatIcon
            size={28}
            name="upload-complete"
            color={
              layout === "vertical"
                ? theme.colors.secondary
                : theme.colors.onSecondary
            }
          />
        </AnimatedView>
        <AnimatedView
          entering={FadeIn.duration( 1000 ).delay( 2000 )}
        >
          {children}
        </AnimatedView>
      </>
    );
  };

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabelText()}
      className="items-center justify-center w-[49px] h-[67px]"
    >
      {displayIcon()}
    </View>
  );
};
export default UploadStatus;
