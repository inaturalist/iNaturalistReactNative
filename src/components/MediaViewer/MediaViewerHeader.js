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
  onClose: ( ) => void,
  photoCount: number,
  soundCount?: number
};

const MediaViewerHeader = ( {
  photoCount = 0,
  onClose,
  soundCount = 0
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  let headerText = t( "X-PHOTOS", { photoCount } );
  if ( soundCount > 0 ) {
    if ( photoCount === 0 ) {
      headerText = t( "X-SOUNDS", { count: soundCount } );
    } else {
      headerText = t( "X-PHOTOS-Y-SOUNDS", { photoCount, soundCount } );
    }
  }

  return (
    <View className="flex-row items-center justify-center min-h-[44]">
      <BackButton
        inCustomHeader
        color={theme.colors.onPrimary}
        customStyles={BACK_BUTTON_STYLE}
        onPress={onClose}
      />
      <Heading4 className="color-white">
        {headerText}
      </Heading4>
    </View>
  );
};

export default MediaViewerHeader;
