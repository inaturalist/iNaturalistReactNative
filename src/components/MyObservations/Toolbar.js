// @flow

import classNames from "classnames";
import {
  Body2,
  Body4,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect } from "react";
import { ProgressBar, useTheme } from "react-native-paper";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type Props = {
  layout: string,
  statusText: ?string,
  handleSyncButtonPress: Function,
  uploadError: ?string,
  uploadInProgress: boolean,
  stopUpload: Function,
  progress: number,
  numUnuploadedObs: number,
  currentUser: ?Object,
  navToExplore: Function,
  toggleLayout: Function,
  needsSync: Function
}

const Toolbar = ( {
  layout,
  statusText,
  handleSyncButtonPress,
  uploadError,
  uploadInProgress,
  stopUpload,
  progress,
  numUnuploadedObs,
  currentUser,
  navToExplore,
  toggleLayout,
  needsSync
}: Props ): Node => {
  const theme = useTheme( );
  const uploadComplete = progress === 1;
  const uploading = uploadInProgress && !uploadComplete;
  const rotation = useSharedValue( 0 );

  const animatedStyles = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: `-${rotation.value}deg`
        }
      ]
    } ),
    [rotation.value]
  );

  const getRotationAnimation = toValue => withDelay(
    500,
    withTiming( toValue, {
      duration: 1000,
      easing: Easing.linear
    } )
  );

  useEffect( () => {
    const cleanup = () => {
      cancelAnimation( rotation );
      rotation.value = 0;
    };

    if ( uploading ) {
      rotation.value = withRepeat(
        withSequence(
          getRotationAnimation( 180 ),
          getRotationAnimation( 360 ),
          withTiming( 0, { duration: 0 } )
        ),
        -1
      );
    } else {
      cleanup();
    }

    return cleanup;
  }, [uploading, rotation] );

  const getSyncIconColor = ( ) => {
    if ( uploadError ) {
      return theme.colors.error;
    } if ( uploading || numUnuploadedObs > 0 ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  };

  return (
    <View className={
      classNames(
        { "border-b border-lightGray": layout !== "grid" }
      )
    }
    >
      <View className="flex-row items-center mx-4">
        {currentUser && (
          <INatIconButton
            icon="compass-rose-outline"
            onPress={navToExplore}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            accessibilityRole="button"
            size={30}
            disabled={false}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="m-0 ml-[-8px]"
          />
        )}
        <View
          // Note that without shrink, the center element will grow and push
          // the grid/list button off the screen
          className="flex-row items-center shrink"
        >
          <Animated.View
            style={animatedStyles}
          >
            <INatIconButton
              icon={
                needsSync( )
                  ? "sync-unsynced"
                  : "sync"
              }
              size={30}
              onPress={handleSyncButtonPress}
              disabled={false}
              accessibilityLabel={t( "Sync-observations" )}
              color={getSyncIconColor( )}
            />
          </Animated.View>

          {statusText && (
            <View className="flex ml-1 shrink">
              <View className="flex-row items-center shrink">
                <Body2
                  onPress={
                    needsSync( )
                      ? handleSyncButtonPress
                      : ( ) => { }
                  }
                >
                  {statusText}
                </Body2>
                {( uploadComplete && !uploadError ) && (
                  <View className="ml-2">
                    <INatIcon name="checkmark" size={11} color={theme.colors.secondary} />
                  </View>
                )}
              </View>
              {uploadError && (
                <Body4 className="mt-[3px] color-warningRed">
                  {uploadError}
                </Body4>
              )}
            </View>
          )}
          {( uploadInProgress && !uploadComplete ) && (
            <INatIconButton
              icon="close"
              size={11}
              accessibilityLabel={t( "Stop-upload" )}
              onPress={stopUpload}
            />
          )}
        </View>
        <INatIconButton
          icon={layout === "grid"
            ? "listview"
            : "gridview"}
          size={30}
          disabled={false}
          accessibilityLabel={layout === "grid"
            ? t( "List-view" )
            : t( "Grid-view" )}
          testID={
            layout === "list"
              ? "MyObservationsToolbar.toggleGridView"
              : "MyObservationsToolbar.toggleListView"
          }
          onPress={toggleLayout}
          // Negative margin here is similar to above: trying to get the icon
          // flush with the container. ml-auto is a bit of a hack to pull
          // this button all the way to the end.
          className="m-0 mr-[-8px] ml-auto"
        />
      </View>
      <ProgressBar
        progress={progress}
        color={theme.colors.secondary}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ backgroundColor: "transparent" }}
        visible={uploadInProgress && progress !== 0}
      />
    </View>
  );
};

export default Toolbar;
