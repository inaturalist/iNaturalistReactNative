// @flow

import { Image, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Avatar } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";

import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

const { useRealm } = RealmContext;

type Props = {
  item: Object,
  handlePress: Function
}

const ObsCard = ( { item, handlePress }: Props ): Node => {
  const [needsUpload, setNeedsUpload] = useState( false );
  const onPress = ( ) => handlePress( item );
  const realm = useRealm( );

  const photo = item?.observationPhotos?.[0]?.photo;

  useEffect( ( ) => {
    const markAsNeedsUpload = async ( ) => {
      const isUnsyncedObs = Observation.isUnsyncedObservation( realm, item );
      setNeedsUpload( isUnsyncedObs );
    };
    markAsNeedsUpload( );
  }, [item, realm] );

  const obsListPhoto = photo ? (
    <Image
      source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
      className="w-16 h-16 rounded-md mr-2"
      testID="ObsList.photo"
    />
  )
    // eslint-disable-next-line react-native/no-inline-styles
    : <IconMaterial name="image-not-supported" size={70} style={{ marginRight: 2 }} />;

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
        {needsUpload
          ? <Avatar.Icon size={40} icon="arrow-up-circle-outline" />
          : <ObsCardStats item={item} type="list" />}
      </View>
    </Pressable>
  );
};

export default ObsCard;
