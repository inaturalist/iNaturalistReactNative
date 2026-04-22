// @flow

import {
  BackButton,
  Heading4,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  onClose: Function,
  photoCount: number,
  soundCount?: number
};

const MediaViewerHeader = ( {
  photoCount = 0,
  onClose,
  soundCount = 0,
}: Props ): Node => {
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
    <View className="flex-row min-h-[44] justify-between">
      <BackButton
        inCustomHeader
        color="white"
        onPress={onClose}
        className="w-[44px]"
      />
      <View className="justify-center min-h-[44]">
        <Heading4 className="color-white">
          {headerText}
        </Heading4>
      </View>
      <View className="w-[44px]" />
    </View>
  );
};

export default MediaViewerHeader;
