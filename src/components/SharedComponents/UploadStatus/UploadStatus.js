// @flow

import classnames from "classnames";
import { INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
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
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  color?: string,
  completeColor?: string,
  handleIndividualUploadPress: Function,
  layout: string,
  // $FlowIgnore
  children: unknown,
  uuid: string
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
  handleIndividualUploadPress,
  layout,
  children,
  uuid
}: Props ): Node => {
  const totalUploadProgress = useStore( state => state.totalUploadProgress );
  const currentObservation = totalUploadProgress.find( o => o.uuid === uuid );
  const progress = currentObservation?.totalProgress || 0;

  const { t } = useTranslation( );
  const theme = useTheme( );
  const defaultColor = theme.colors.primary;
  const defaultCompleteColor = theme.colors.secondary;
  const animation = useSharedValue( 0 );
  const rotation = useDerivedValue( ( ) => interpolate(
    animation.value,
    [0, 1],
    [0, 360]
  ) );
  const rotate = useAnimatedStyle( ( ) => ( {
    transform: [
      {
        rotateZ: `${rotation.value}deg`
      }
    ]
  } ), [rotation.value] );

  const startAnimation = ( ) => {
    animation.value = withRepeat(
      withTiming( 1, {
        duration: 10000,
        easing: Easing.linear
      } ),
      -1
    );
  };

  const accessibilityLabelText = ( ) => {
    if ( progress < 0.05 ) {
      return t( "Saved-Observation" );
    }
    if ( progress < 1 ) {
      const translationParams = {
        uploadProgress: progress * 100
      };
      return t( "Upload-Progress", translationParams );
    }
    return t( "Upload-Complete" );
  };

  const uploadSingleObservation = ( ) => {
    startAnimation( );
    handleIndividualUploadPress( uuid );
  };

  useEffect( ( ) => ( ) => cancelAnimation( rotation ), [rotation] );

  const showProgressArrow = ( ) => (
    <View
      className={classnames( "absolute", {
        "ml-2 mt-2": layout === "horizontal",
        "mt-2.5": layout === "horizontal" && progress > 0.05 && progress < 1
      } )}
      accessibilityLabel={t( "Upload-in-progress" )}
      testID={`UploadIcon.progress.${uuid}`}
    >
      <INatIcon
        name="upload-arrow"
        color={color || defaultColor}
        size={15}
      />
    </View>
  );

  const startUploadIcon = (
    <INatIconButton
      icon="upload-saved"
      color={color || defaultColor}
      size={33}
      onPress={uploadSingleObservation}
      disabled={false}
      accessibilityLabel={t( "Start-upload" )}
      testID={`UploadIcon.start.${uuid}`}
    />
  );

  const iconClasses = [
    "items-center",
    "justify-center",
    "w-[44px]",
    "h-[44px]"
  ];

  const uploadTappedIcon = (
    <View className={classnames( iconClasses )}>
      {showProgressArrow( )}
      <AnimatedView style={rotate}>
        <INatIcon name="circle-dots" color={color || defaultColor} size={33} />
      </AnimatedView>
    </View>
  );

  const uploadInProgressIcon = (
    <View className={classnames( iconClasses )}>
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
        activeStrokeWidth={2.5}
      />
    </View>
  );

  const uploadCompleteIcon = (
    <View className={classnames( iconClasses )}>
      <INatIcon
        size={28}
        name="upload-complete"
        color={
          layout === "vertical"
            ? defaultCompleteColor
            : theme.colors.onSecondary
        }
      />
    </View>
  );

  const fadeOutUploadCompleteIcon = (
    <AnimatedView
      entering={keyframe.duration( 2000 )}
      testID={`UploadIcon.complete.${uuid}`}
    >
      { uploadCompleteIcon }
    </AnimatedView>
  );

  const fadeInObsStatusComponent = (
    <AnimatedView entering={FadeIn.duration( 1000 ).delay( 2000 )}>
      {children}
    </AnimatedView>
  );

  const iconWraperClasses = classnames( {
    "items-center justify-center w-[49px]": layout === "vertical"
  } );

  const displayUploadStatus = ( ) => {
    if ( progress === 0 ) {
      return (
        <View className={iconWraperClasses}>
          {startUploadIcon}
        </View>
      );
    }
    if ( progress <= 0.05 ) {
      return (
        <View className={iconWraperClasses}>
          {uploadTappedIcon}
        </View>
      );
    }
    if ( progress > 0.05 && progress < 1 ) {
      return (
        <View className={iconWraperClasses}>
          {uploadInProgressIcon}
        </View>
      );
    }
    // Test of end state before animation
    if ( progress === 10 ) {
      return (
        <View className={iconWraperClasses}>
          {uploadCompleteIcon}
        </View>
      );
    }
    // Test of end state with all elements overlayed
    if ( progress === 11 ) {
      return (
        <View className="justify-center">
          <View
            className={classnames( "absolute", {
              "bottom-0": layout === "horizontal"
            } )}
          >
            <View className={iconWraperClasses}>
              {uploadCompleteIcon}
            </View>
          </View>
          {children}
        </View>
      );
    }
    return (
      <>
        <View
          className={classnames( "absolute", {
            "bottom-0": layout === "horizontal"
          } )}
        >
          <View className={iconWraperClasses}>
            {fadeOutUploadCompleteIcon}
          </View>
        </View>
        {fadeInObsStatusComponent}
      </>
    );
  };

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabelText( )}
      className={classnames( {
        "h-[44px] justify-end": layout === "horizontal",
        "justify-center": layout !== "horizontal"
      } )}
    >
      {displayUploadStatus( )}
    </View>
  );
};
export default UploadStatus;
