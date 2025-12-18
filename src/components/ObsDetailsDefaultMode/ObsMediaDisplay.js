// @flow
import classnames from "classnames";
import {
  INatIcon,
  PhotoCount,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation,
} from "sharedHooks";
import colors from "styles/tailwindColors";

import ObsMedia from "./ObsMedia";

type Props = {
  loading: boolean,
  photos: Object[],
  sounds: Object[]
}

const ObsMediaDisplay = ( {
  loading,
  photos = [],
  sounds = [],
}: Props ): Node => {
  const { t } = useTranslation( );

  const items = [...photos, ...sounds];

  if ( items.length > 0 || loading ) {
    return (
      <View className="bg-black">
        <ObsMedia
          loading={loading}
          photos={photos}
          sounds={sounds}
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
        "bg-black flex-row justify-center items-center h-72",
      )}
      accessible
      accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
    >
      <INatIcon name="noevidence" size={96} color={colors.white} />
    </View>
  );
};

export default ObsMediaDisplay;
