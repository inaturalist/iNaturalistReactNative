// @flow
import {
  INatIcon,
  PhotoCount,
  PhotoScroll
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import {
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  isOnline: boolean,
  photos: Array<Object>
}

const PhotoDisplay = ( {
  isOnline,
  photos
}: Props ): Node => {
  const { t } = useTranslation( );

  if ( photos.length > 0 ) {
    return (
      <View className="bg-black">
        {
          isOnline
            ? (
              <PhotoScroll
                photos={photos}
              />
            )
            : (
              <View className="bg-black flex-row justify-center">
                <IconMaterial
                  name="wifi-off"
                  color={colors.white}
                  size={100}
                  accessibilityRole="image"
                  accessibilityLabel={t(
                    "Observation-photos-unavailable-without-internet"
                  )}
                />
              </View>
            )
        }
        <View className="absolute bottom-5 left-5">
          <PhotoCount count={photos.length
            ? photos.length
            : 0}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      className="bg-black flex-row justify-center items-center h-72"
      accessible
      accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
    >
      <INatIcon
        name="noevidence"
        size={96}
        color={colors.white}
      />
    </View>
  );
};

export default PhotoDisplay;
