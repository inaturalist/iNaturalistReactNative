import classnames from "classnames";
import ObsMedia from "components/ObsDetailsSharedComponents/Media/ObsMedia";
import type { MediaPhotoItem } from "components/ObsDetailsSharedComponents/Media/PhotoContainer";
import type { MediaSoundItem } from "components/ObsDetailsSharedComponents/Media/SoundContainer";
import {
  INatIcon,
  PhotoCount,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import {
  useTranslation,
} from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  loading: boolean;
  photos: MediaPhotoItem[];
  sounds: MediaSoundItem[];
  tablet?: boolean;
}

const ObsMediaDisplay = ( {
  loading,
  photos = [],
  sounds = [],
  tablet = false,
}: Props ) => {
  const { t } = useTranslation( );

  const items = [...photos, ...sounds];

  if ( items.length > 0 || loading ) {
    return (
      <View className="bg-black">
        <ObsMedia
          loading={loading}
          photos={photos}
          sounds={sounds}
          tablet={tablet}
        />
        {!loading && items.length > 1 && (
          <View className="absolute bottom-5 left-5">
            <PhotoCount count={items.length} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      className={classnames(
        "bg-black flex-row justify-center items-center",
        tablet
          ? "h-full"
          : "h-72",
      )}
      accessible
      accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
    >
      <INatIcon name="noevidence" size={96} color={colors.white} />
    </View>
  );
};

export default ObsMediaDisplay;
