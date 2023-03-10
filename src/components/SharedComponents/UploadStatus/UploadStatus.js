// @flow

import INatIcon from "components/SharedComponents/INatIcon";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Animated, Easing } from "react-native";
import CircularProgressBase from "react-native-circular-progress-indicator";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  color?: string,
  completeColor?: string,
  progress: number,
  startSingleUpload: Function,
  buttonDisabled: boolean,
  children: any
}

const UploadStatus = ( {
  color, completeColor, progress, startSingleUpload,
  children, buttonDisabled
}: Props ): Node => {
  const theme = useTheme();
  const defaultColor = theme.colors.primary;
  const defaultCompleteColor = theme.colors.secondary;
  const rotateAnimation = new Animated.Value( 0 );

  Animated.loop(
    Animated.timing( rotateAnimation, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: true
    } )
  ).start( () => {
    rotateAnimation.setValue( 0 );
  } );

  // const interpolateRotating = rotateAnimation.interpolate( {
  //   inputRange: [0, 1],
  //   outputRange: ["0deg", "360deg"]
  // } );

  // const rotate = {
  //   transform: [
  //     {
  //       rotate: interpolateRotating
  //     }
  //   ]
  // };

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
    if ( progress < 0.05 ) {
      return (
        <>
          {/* <Animated.View style={rotate}>
            <INatIcon name="dotted-outline" color={color || defaultColor} size={33} />
          </Animated.View> */}
          <IconButton
            icon="upload-saved"
            iconColor={color || defaultColor}
            size={33}
            onPress={!buttonDisabled && startSingleUpload}
            disabled={false}
            accessibilityState={{ disabled: false }}
          />
        </>
      );
    }
    if ( progress < 1 ) {
      return (
        <>
          <View className="absolute">
            <INatIcon
              name="arrow-up-plain"
              color={color || defaultColor}
              size={15}
            />
          </View>
          <CircularProgressBase
            testID="UploadStatus.CircularProgress"
            value={progress}
            radius={16.5}
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
