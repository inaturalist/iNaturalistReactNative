// @flow
import classnames from "classnames";
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Photo from "realmModels/Photo";

import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  onPress: Function,
};

const ObsListItem = ( { observation, onPress }: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo || null;
  const needsSync = observation.needsSync( );

  const obsListPhoto = photo ? (
    <Image
      source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
      className={classnames( "w-[62px] h-[62px] rounded-md mr-2", {
        "opacity-50": needsSync
      } )}
      testID="ObsList.photo"
    />
  ) : (
    /* eslint-disable react-native/no-inline-styles */
    <IconMaterial
      name="image-not-supported"
      size={70}
      style={{ marginRight: 2 }}
    />
  );

  return (
    <Pressable
      onPress={( ) => onPress( observation )}
      className="flex-row my-2 mx-3"
      testID={`ObsList.obsListItem.${observation.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      {obsListPhoto}
      <View className="shrink">
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={
            observation?.user?.prefers_scientific_name_first
          }
          layout="vertical"
        />
        <ObservationLocation observation={observation} />
        <DateDisplay dateTime={observation?._created_at} />
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
