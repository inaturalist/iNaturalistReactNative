// @flow

import classNames from "classnames";
import { Body2, Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Animated, Easing } from "react-native";
import { IconButton, ProgressBar, useTheme } from "react-native-paper";

type Props = {
  layout: string,
  statusText: ?string,
  handleSyncButtonPress: Function,
  uploadError: string,
  uploadInProgress: boolean,
  stopUpload: Function,
  progress: number,
  numUnuploadedObs: number,
  currentUser: ?Object,
  navToExplore: Function,
  toggleLayout: Function,
  getSyncIcon: Function
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
  getSyncIcon
}: Props ): Node => {
  const theme = useTheme( );
  const spinValue = new Animated.Value( 1 );
  const uploadComplete = progress === 1;
  const uploading = uploadInProgress && !uploadComplete;

  Animated.timing( spinValue, {
    toValue: 0,
    duration: 3000,
    easing: Easing.linear,
    useNativeDriver: true
  } ).start( );

  const spin = spinValue.interpolate( {
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  } );

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
        "bg-white h-[78px]",
        { "border-b border-lightGray": layout !== "grid" }
      )
    }
    >
      <View className="flex-row justify-between items-center px-[7px]">
        <View className="flex-row items-center">
          {currentUser && (
            <IconButton
              icon="compass-rose-outline"
              onPress={navToExplore}
              accessibilityLabel={t( "Explore" )}
              accessibilityHint={t( "Navigates-to-explore" )}
              accessibilityRole="button"
              size={30}
              disabled={false}
              accessibilityState={{ disabled: false }}
            />
          )}
          <Animated.View
            style={uploading ? { transform: [{ rotate: spin }] } : {}}
          >
            <IconButton
              icon={getSyncIcon( )}
              size={30}
              onPress={handleSyncButtonPress}
              accessibilityRole="button"
              disabled={false}
              accessibilityState={{ disabled: false }}
              iconColor={getSyncIconColor( )}
            />
          </Animated.View>

          {statusText && (
            <View className="max-w-[200px] sm:max-w-[190px]">
              <View className="flex-row items-center">
                <Body2>{statusText}</Body2>
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
            <IconButton
              icon="close"
              size={11}
              iconColor={theme.colors.primary}
              onPress={stopUpload}
              accessibilityRole="button"
            />
          )}
        </View>
        <IconButton
          icon={layout === "grid" ? "listview" : "gridview"}
          size={30}
          disabled={false}
          accessibilityState={{ disabled: false }}
          testID={
            layout === "list"
              ? "MyObservationsToolbar.toggleGridView"
              : "MyObservationsToolbar.toggleListView"
          }
          onPress={toggleLayout}
          accessibilityRole="button"
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
