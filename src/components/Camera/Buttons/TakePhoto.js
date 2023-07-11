// @flow

import classnames from "classnames";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  takePhoto: Function,
  disallowAddingPhotos: boolean
}

const TakePhoto = ( {
  takePhoto,
  disallowAddingPhotos
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <Pressable
      className={classnames(
        "bg-white",
        "rounded-full",
        "h-[60px]",
        "w-[60px]",
        "justify-center",
        "items-center"
      )}
      onPress={takePhoto}
      accessibilityLabel={t( "Take-photo" )}
      accessibilityRole="button"
      accessibilityState={{ disabled: disallowAddingPhotos }}
      disabled={disallowAddingPhotos}
    >
      <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />
    </Pressable>
  );
};

export default TakePhoto;
