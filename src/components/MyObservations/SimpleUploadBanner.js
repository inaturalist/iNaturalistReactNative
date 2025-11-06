// @flow

import classnames from "classnames";
import {
  Body2,
  INatIcon,
  INatIconButton,
  UploadProgressBar
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  error: ?string,
  handleSyncButtonPress: Function,
  progress: number,
  syncDisabled: boolean,
  showsCancelUploadButton: boolean,
  showsCheckmark: boolean,
  status: {
    text: string,
    styling: string
  },
  stopAllUploads: Function
}

const SimpleUploadBanner = ( {
  error,
  handleSyncButtonPress,
  progress = 0,
  syncDisabled = false,
  showsCancelUploadButton = false,
  showsCheckmark = false,
  status,
  stopAllUploads
}: Props ): Node => {
  const { t } = useTranslation( );

  const isWhiteOnGreenStyling = status.styling === "white-on-green";
  const separator = " • ";

  const renderCancelButton = ( ) => (
    <INatIconButton
      icon="close"
      size={11}
      accessibilityLabel={t( "Stop-upload" )}
      onPress={stopAllUploads}
    />
  );

  const renderCheckmark = ( ) => (
    <View className="ml-2 mr-6">
      <INatIcon name="checkmark" size={11} color={colors.inatGreen} />
    </View>
  );

  const renderErrorText = ( ) => (
    <Body2 className="color-white flex-1 text-center">
      {isWhiteOnGreenStyling
        ? separator
        : ""}
      <Body2 className="color-warningRed text-center">{error}</Body2>
    </Body2>
  );

  const renderUploadStatusText = () => (
    <View
      className={classnames( "bg-white items-center", {
        "bg-inatGreen": isWhiteOnGreenStyling
      } )}
    >
      <View className="flex-row items-center">
        {status.text && (
          <Pressable
            onPress={handleSyncButtonPress}
            accessibilityRole="button"
            disabled={syncDisabled}
            className="flex-[2] ml-2"
          >
            <Body2
              className={classnames( "text-darkGray py-3 text-center", {
                "text-white": status.styling === "white-on-green"
              } )}
              numberOfLines={2}
            >
              {status.text}
            </Body2>
          </Pressable>
        )}
        {error && renderErrorText( )}
        {showsCancelUploadButton && renderCancelButton( )}
        {showsCheckmark && renderCheckmark( )}
      </View>
    </View>
  );

  return (
    <View className="py-2 w-full">
      {( status.text !== "" || !!error ) && renderUploadStatusText( )}
      <UploadProgressBar progress={progress} />
    </View>
  );
};

export default SimpleUploadBanner;
