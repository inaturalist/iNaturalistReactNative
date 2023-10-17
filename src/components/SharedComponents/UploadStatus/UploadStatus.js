// @flow

import { INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect } from "react";
import CircularProgressBase from "react-native-circular-progress-indicator";
import { useTheme } from "react-native-paper";
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
  uploadObservation: Function,
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
  uploadObservation,
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

  const startUpload = async ( ) => {
    startAnimation();
    await uploadObservation( );
  };

  useEffect( () => () => cancelAnimation( rotation ), [rotation] );

  const showProgressArrow = ( ) => (
    <View className="absolute" accessibilityLabel={t( "Upload-in-progress" )}>
      <INatIcon
        name="upload-arrow"
        color={color || defaultColor}
        size={15}
      />
    </View>
  );

  const displayIcon = () => {
    if ( progress === 0 ) {
      return (
        <INatIconButton
          icon="upload-saved"
          color={color || defaultColor}
          size={33}
          onPress={startUpload}
          disabled={false}
          accessibilityLabel={t( "Start-upload" )}
        />
      );
    }
    if ( progress <= 0.05 ) {
      return (
        <>
          {showProgressArrow( )}
          <AnimatedView style={rotate}>
            <INatIcon name="circle-dots" color={color || defaultColor} size={33} />
          </AnimatedView>
        </>
      );
    }
    if ( progress > 0.05 && progress < 1 ) {
      return (
        <>
          {showProgressArrow( )}
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
