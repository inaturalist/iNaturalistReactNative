// @flow
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsPreviewImage from "./ObsPreviewImage";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object
};

const ObsListItem = ( { observation }: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo || null;
  const needsSync = observation.needsSync( );

  return (
    <View
      testID={`ObsList.obsListItem.${observation.uuid}`}
      className="flex-row my-2 px-[10px]"
    >
      <ObsPreviewImage
        uri={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        observation={observation}
        opaque={needsSync}
        disableGradient
      />
      <View>
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={observation?.user?.prefers_scientific_name_first}
          layout="horizontal"
        />
        <ObservationLocation observation={observation} margin="mt-1" />
        <DateDisplay dateTime={observation?._created_at} margin="mt-1" />
      </View>
      <View className="items-center justify-center ml-auto">
        {needsSync ? (
          <UploadButton observation={observation} />
        ) : (
          <ObsStatus observation={observation} layout="vertical" />
        )}
      </View>
    </View>
  );
};

export default ObsListItem;
