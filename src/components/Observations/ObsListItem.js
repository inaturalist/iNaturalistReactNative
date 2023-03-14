// @flow
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObservationInfo from "./ObservationInfo";
import ObsPreviewImage from "./ObsPreviewImage";

type Props = {
  observation: Object
};

const ObsListItem = ( { observation }: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo || null;
  const needsSync = observation.needsSync( );

  return (
    <View
      testID={`ObsList.obsListItem.${observation.uuid}`}
      className="flex-row px-[15px] my-[11px]"
    >
      <ObsPreviewImage
        source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        obsPhotosCount={observation?.observationPhotos?.length ?? 0}
        hasSound={!!observation?.observationSounds?.length}
        opaque={needsSync}
        disableGradient
        hasSmallBorderRadius
      />
      <View className="pr-[25px] flex-1 ml-[10px]">
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={observation?.user?.prefers_scientific_name_first}
          layout="horizontal"
        />
        <ObservationLocation observation={observation} classNameMargin="mt-1" />
        <DateDisplay
          dateString={
            observation.time_observed_at || observation.observed_on_string
          }
          classNameMargin="mt-1"
        />
      </View>
      <View className="ml-auto">
        <ObservationInfo observation={observation} obsStatusLayout="vertical" />
      </View>
    </View>
  );
};

export default ObsListItem;
