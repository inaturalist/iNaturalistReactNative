// @flow

import { Image, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Photo from "realmModels/Photo";

import ObsCardDetails from "./ObsCardDetails";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  item: Object,
  handlePress: Function,
};

const ObsCard = ( { item, handlePress }: Props ): Node => {
  const onPress = () => handlePress( item );

  const photo = item?.observationPhotos && item.observationPhotos[0]
    ? item.observationPhotos[0].photo
    : null;

  const obsListPhoto = photo ? (
    <Image
      source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
      className="w-16 h-16 rounded-md mr-2"
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
      onPress={onPress}
      className="flex-row my-2 mx-3 justify-between"
      testID={`ObsList.obsCard.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <View className="flex-row shrink">
        {obsListPhoto}
        <View className="shrink">
          <ObsCardDetails item={item} />
        </View>
      </View>
      <View className="flex-row items-center justify-items-center ml-2">
        {item.needsSync() ? (
          <UploadButton observation={item} />
        ) : (
          <ObsStatus item={item} layout="vertical" />
        )}
      </View>
    </Pressable>
  );
};

export default ObsCard;
