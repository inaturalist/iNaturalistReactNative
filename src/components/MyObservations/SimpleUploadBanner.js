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
    <View className="ml-2">
      <INatIcon name="checkmark" size={11} color={colors.inatGreen} />
    </View>
  );

  const renderErrorText = ( ) => (
    <Body2 className="color-white">
      {separator}
      <Body2 className="color-warningRed">{error}</Body2>
    </Body2>
  );

  const renderUploadStatusText = () => (
    <View
      className={classnames( "bg-white items-center", {
        "bg-inatGreen": status.styling === "white-on-green"
      } )}
    >
      <View className="flex-row items-center">
        <Pressable
          onPress={handleSyncButtonPress}
          accessibilityRole="button"
          disabled={syncDisabled}
        >
          <Body2
            className={classnames( "text-darkGray py-3", {
              "text-white": status.styling === "white-on-green"
            } )}
          >
            {status.text}
          </Body2>
        </Pressable>
        {error && renderErrorText( )}
        {showsCancelUploadButton && renderCancelButton( )}
        {showsCheckmark && renderCheckmark( )}
      </View>
    </View>
  );

  return (
    <View className="py-2">
      {status.text !== "" && renderUploadStatusText( )}
      <UploadProgressBar progress={progress} />
    </View>
  );
};

export default SimpleUploadBanner;
