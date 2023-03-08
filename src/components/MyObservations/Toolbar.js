// @flow

import { Body2, Body4, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Animated, Easing } from "react-native";
import { IconButton, ProgressBar, useTheme } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  layout: string,
  statusText: ?string,
  handleSyncButtonPress: Function,
  syncDisabled: boolean,
  uploadError: string,
  uploadInProgress: boolean,
  stopUpload: Function,
  progress: number,
  numUnuploadedObs: number,
  currentUser: ?Object,
  navToExplore: Function,
  toggleLayout: Function,
  setSyncIcon: Function
}

const Toolbar = ( {
  layout,
  statusText,
  handleSyncButtonPress,
  syncDisabled,
  uploadError,
  uploadInProgress,
  stopUpload,
  progress,
  numUnuploadedObs,
  currentUser,
  navToExplore,
  toggleLayout,
  setSyncIcon
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

  const setSyncIconColor = ( ) => {
    if ( uploadError ) {
      return theme.colors.error;
    }
    if ( uploading || numUnuploadedObs > 0 ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  };

  return (
    <View className={
      `bg-white justify-center h-[78px] ${layout !== "grid" ? "border-b border-lightGray" : ""}`
    }
    >
      <View className="flex-row items-center px-[15px]">
        {currentUser && (
          <IconButton
            icon="compass-rose"
            onPress={navToExplore}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            accessibilityRole="button"
            disabled={false}
            size={26}
          />
        )}

        <Animated.View
          style={uploading ? { transform: [{ rotate: spin }] } : {}}
        >
          <IconButton
            icon={setSyncIcon( )}
            size={26}
            onPress={handleSyncButtonPress}
            accessibilityRole="button"
            disabled={syncDisabled}
            accessibilityState={{ disabled: syncDisabled }}
            iconColor={setSyncIconColor( )}
          />
        </Animated.View>

        {statusText && (
          <View className="flex-row items-center">
            <Body2 className="ml-1">{statusText}</Body2>
            {uploadError && (
            <Body4 className="ml-1 mt-[3px] color-warningRed">
              {uploadError}
            </Body4>
            )}
            {uploadComplete && (
              <View className="ml-2">
                <INatIcon name="checkmark" size={11} color={theme.colors.secondary} />
              </View>
            )}
          </View>
        )}

        <View className="ml-auto flex-row items-center">
          {( uploadInProgress && !uploadComplete ) && (
            <Pressable onPress={stopUpload} accessibilityRole="button">
              <IconMaterial name="close" size={11} color={theme.colors.primary} />
            </Pressable>
          )}

          <Pressable
            className="ml-2"
            testID={
              layout === "list"
                ? "MyObservationsToolbar.toggleGridView"
                : "MyObservationsToolbar.toggleListView"
            }
            onPress={toggleLayout}
            accessibilityRole="button"
          >
            <IconButton
              icon={layout === "grid" ? "listview" : "gridview"}
              size={30}
            />
          </Pressable>
        </View>
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
