// @flow

import INatIcon from "components/SharedComponents/INatIcon";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect } from "react";
import CircularProgressBase from "react-native-circular-progress-indicator";
import { IconButton, useTheme } from "react-native-paper";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

type Props = {
  color?: string,
  completeColor?: string,
  progress: number,
  startSingleUpload: Function,
  children: any
}

const UploadStatus = ( {
  color, completeColor, progress, startSingleUpload,
  children
}: Props ): Node => {
  const theme = useTheme();
  const defaultColor = theme.colors.primary;
  const defaultCompleteColor = theme.colors.secondary;
  const rotation = useSharedValue( 0 );

  const animatedStyles = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: `${rotation.value}deg`
        }
      ]
    } ),
    [rotation.value]
  );

  useEffect( () => {
    const cleanup = () => {
      cancelAnimation( rotation );
      rotation.value = 0;
    };

    if ( progress < 0.05 ) {
      rotation.value = withRepeat(
        withTiming( 360, {
          duration: 10000,
          easing: Easing.linear
        } ),
        -1
      );
    } else {
      cleanup();
    }

    return cleanup;
  }, [progress, rotation] );

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

  const displayIcon = ( ) => {
    if ( progress === 0 ) {
      return (
        <IconButton
          icon="upload-saved"
          iconColor={color || defaultColor}
          size={33}
          onPress={startSingleUpload}
          disabled={false}
          accessibilityState={{ disabled: false }}
        />
      );
    }

    if ( progress < 0.05 ) {
      return (
        <View className="relative flex items-center justify-center">
          <View className="absolute">
            <INatIcon
              name="upload-arrow"
              color={color || defaultColor}
              size={15}
            />
          </View>
          <Animated.View style={animatedStyles}>
            <INatIcon name="circle-dots" color={color || defaultColor} size={33} />
          </Animated.View>
        </View>
      );
    }

    if ( progress < 1 ) {
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
            activeStrokeColor={( progress < 1 )
              ? ( color || defaultColor ) : ( completeColor || defaultCompleteColor )}
            showProgressValue={false}
            maxValue={1}
            inActiveStrokeOpacity={0}
            activeStrokeWidth={2}
          />
        </>
      );
    }
    return (
      <View className="absolute">
        {children}
      </View>
    );
  };

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabelText()}
      className="items-center justify-center w-[49px] h-[67px]"
    >
      {displayIcon( )}
    </View>
  );
};
export default UploadStatus;
