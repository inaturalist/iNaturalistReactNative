// @flow

import ObsImagePreview from "components/MyObservations/ObsImagePreview";
import ObsStatus from "components/MyObservations/ObsStatus";
import { DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";

type Props = {
  observation: Object,
  width?: string,
  height?: string,
  style?: Object
};

const ProjectObsGridItem = ( {
  observation,
  width = "w-full",
  height,
  style
}: Props ): Node => (
  <ObsImagePreview
    source={Observation.projectUri( observation )}
    width={width}
    height={height}
    style={style}
    obsPhotosCount={observation?.observationPhotos?.length ?? 0}
    hasSound={!!observation?.observationSounds?.length}
    isMultiplePhotosTop
    testID={`ProjectObservations.gridItem.${observation.uuid}`}
  >
    <View className="absolute bottom-0 flex p-2 w-full">
      {!observation.needsSync?.( ) && (
        <ObsStatus
          observation={observation}
          layout="horizontal"
          white
          classNameMargin="mb-1"
        />
      )}
      <DisplayTaxonName
        taxon={observation?.taxon}
        scientificNameFirst={
          observation?.user?.prefers_scientific_name_first
        }
        layout="vertical"
        color="text-white"
      />
    </View>
  </ObsImagePreview>
);

export default ProjectObsGridItem;
