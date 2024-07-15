// @flow

import classNames from "classnames";
import {
  Body2,
  Body4,
  INatIcon,
  INatIconButton,
  RotatingINatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ProgressBar, useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

type Props = {
  error: ?string,
  handleSyncButtonPress: Function,
  layout: string,
  navToExplore: Function,
  progress: number,
  rotating?: boolean,
  showsCancelUploadButton?: boolean,
  showsCheckmark?: boolean,
  showsExclamation?: boolean,
  showsExploreIcon?: boolean,
  statusText: ?string,
  stopAllUploads: Function,
  syncIconColor: string,
  toggleLayout: Function
}

const Toolbar = ( {
  error,
  handleSyncButtonPress,
  layout,
  navToExplore,
  progress,
  rotating = false,
  showsCancelUploadButton = false,
  showsCheckmark = false,
  showsExclamation: showsExclamationProp = false,
  showsExploreIcon = false,
  statusText = "",
  stopAllUploads,
  syncIconColor,
  toggleLayout
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  // The exclamation mark should *never* appear while rotating, no matter what
  // the props say
  let showsExclamation = showsExclamationProp;
  if ( rotating ) showsExclamation = false;
  return (
    <View className={
      classNames(
        { "border-b border-lightGray": layout !== "grid" }
      )
    }
    >
      <View className="flex-row mx-4">
        {/* First col */}
        {showsExploreIcon && (
          <INatIconButton
            icon="compass-rose-outline"
            onPress={navToExplore}
            accessibilityLabel={t( "See-all-your-observations-in-explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            accessibilityRole="button"
            size={30}
            disabled={false}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="-ml-[7px]"
          />
        )}

        {/*
          Center col. Initial width of 0 seems to be a hack that works to get
          grow to work correctly with text content
        */}
        <View
          className={classNames(
            "w-[0px] grow",
            !showsExploreIcon && "-ml-[11px]"
          )}
        >
          <View className="flex-row ml-1">
            <View className="mr-1">
              <RotatingINatIconButton
                icon={
                  showsExclamation
                    ? "sync-unsynced"
                    : "sync"
                }
                rotating={rotating}
                onPress={handleSyncButtonPress}
                color={syncIconColor}
                disabled={rotating}
                accessibilityLabel={t( "Sync-observations" )}
                size={30}
                testID="SyncButton"
              />
            </View>
            <View className="flex-row shrink">
              <View className="shrink pb-1 justify-center">
                { statusText !== "" && (
                  <Pressable
                    onPress={handleSyncButtonPress}
                    className="flex-row items-center grow"
                    accessibilityRole="button"
                    disabled={rotating || showsCheckmark}
                  >
                    <Body2>
                      {statusText}
                    </Body2>
                    {showsCheckmark && (
                      <View className="ml-2">
                        <INatIcon name="checkmark" size={11} color={theme.colors.secondary} />
                      </View>
                    )}
                  </Pressable>
                )}
                {error && (
                  statusText === ""
                    ? <Body2 className="color-warningRed">{error}</Body2>
                    : <Body4 className="color-warningRed">{error}</Body4>
                )}
              </View>
              {showsCancelUploadButton && (
                <INatIconButton
                  icon="close"
                  size={11}
                  accessibilityLabel={t( "Stop-upload" )}
                  onPress={stopAllUploads}
                />
              )}
            </View>
          </View>
        </View>

        {/* Last col */}
        <INatIconButton
          icon={layout === "grid"
            ? "listview"
            : "gridview"}
          size={30}
          disabled={false}
          accessibilityLabel={layout === "grid"
            ? t( "List-layout" )
            : t( "Grid-layout" )}
          testID={
            layout === "list"
              ? "MyObservationsToolbar.toggleGridView"
              : "MyObservationsToolbar.toggleListView"
          }
          onPress={toggleLayout}
          // Negative margin here is similar to above: trying to get the icon
          // flush with the container. ml-auto is a bit of a hack to pull
          // this button all the way to the end.
          className="-mr-[7px]"
        />
      </View>
      <ProgressBar
        progress={progress}
        color={theme.colors.secondary}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ backgroundColor: "transparent" }}
        visible={progress > 0}
      />
    </View>
  );
};

export default Toolbar;
