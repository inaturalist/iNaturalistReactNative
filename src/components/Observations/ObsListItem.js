// @flow
import { Image, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import classnames from "classnames";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Photo from "realmModels/Photo";
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation } from "components/SharedComponents";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  onPress: Function,
};

const ObsListItem = ({ observation, onPress }: Props): Node => {
  const photo =
    observation?.observationPhotos && observation.observationPhotos[0]
      ? observation.observationPhotos[0].photo
      : null;

  const needsSync = observation.needsSync( );

  const obsListPhoto = photo ? (
    <Image
      source={{ uri: Photo.displayLocalOrRemoteSquarePhoto(photo) }}
      className={classnames("w-[62px] h-[62px] rounded-md mr-2", {
        "opacity-50": needsSync,
      })}
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
      onPress={( ) => onPress(observation)}
      className="flex-row my-2 mx-3 justify-between"
      testID={`ObsList.obsListItem.${observation.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t("Navigate-to-observation-details")}
    >
      <View className="flex-row shrink">
        {obsListPhoto}
        <View className="shrink">
          <DisplayTaxonName layout="vertical" item={observation} />
          <ObservationLocation observation={observation} />
          <DateDisplay dateTime={observation?._created_at} />
        </View>
      </View>
      <View className="flex-row items-center justify-items-center ml-2">
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
