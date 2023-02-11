// @flow
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsPreviewImage from "./ObsPreviewImage";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  onPress: Function,
};

const ObsListItem = ( { observation, onPress }: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo || null;
  const needsSync = observation.needsSync( );

  return (
    <Pressable
      onPress={( ) => onPress( observation )}
      className="flex-row my-2 px-[10px]"
      testID={`ObsList.obsListItem.${observation.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <ObsPreviewImage
        uri={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        observation={observation}
        opaque={needsSync}
      />
      <View className="shrink">
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={observation?.user?.prefers_scientific_name_first}
          layout="vertical"
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
    </Pressable>
  );
};

export default ObsListItem;
