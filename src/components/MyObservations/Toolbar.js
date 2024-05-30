// @flow

import classNames from "classnames";
import {
  Body2,
  Body4,
  INatIcon,
  INatIconButton,
  RotatingINatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
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
  rotating: boolean,
  showsCancelUploadButton: boolean,
  showsCheckmark: boolean,
  showsExclamation: boolean,
  showsExploreIcon: boolean,
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
  rotating,
  showsCancelUploadButton,
  showsCheckmark,
  showsExclamation,
  showsExploreIcon,
  statusText,
  stopAllUploads,
  syncIconColor,
  toggleLayout
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  return (
    <View className={
      classNames(
        { "border-b border-lightGray": layout !== "grid" }
      )
    }
    >
      <View className="flex-row items-center mx-4">
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
            className="m-0 ml-[-8px]"
          />
        )}
        <View
        // Note that without shrink, the center element will grow and push
        // the grid/list button off the screen
          className="flex-row items-center shrink"
        >
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
          <View className="flex ml-1 shrink">
            {statusText && (
              <View className="flex-row items-center shrink">
                <Body2>
                  {statusText}
                </Body2>
                {showsCheckmark && (
                  <View className="ml-2">
                    <INatIcon name="checkmark" size={11} color={theme.colors.secondary} />
                  </View>
                )}
              </View>
            )}
            {error && (
              <Body4 className="mt-[3px] color-warningRed">
                {error}
              </Body4>
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
        visible={progress > 0}
      />
    </View>
  );
};

export default Toolbar;
