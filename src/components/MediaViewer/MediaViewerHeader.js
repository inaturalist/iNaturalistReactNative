// @flow

import {
  BackButton,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

const BACK_BUTTON_STYLE = { position: "absolute", start: 0 };

type Props = {
  photoCount: number,
  onClose: Function
};

const MediaViewerHeader = ( { photoCount, onClose }: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  return (
    <View className="flex-row items-center justify-center min-h-[44]">
      <BackButton
        inCustomHeader
        color={theme.colors.onPrimary}
        customStyles={BACK_BUTTON_STYLE}
        onPress={onClose}
      />
      <Heading4 className="color-white">
        {t( "X-PHOTOS", { photoCount } )}
      </Heading4>
    </View>
  );
};

export default MediaViewerHeader;
