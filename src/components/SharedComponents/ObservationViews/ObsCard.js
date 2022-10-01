// @flow

import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Avatar } from "react-native-paper";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";
import Photo from "../../../models/Photo";
import { Image, Pressable } from "../../styledComponents";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  item: Object,
  handlePress: Function
}

const ObsCard = ( { item, handlePress }: Props ): Node => {
  const [needsUpload, setNeedsUpload] = useState( false );
  const onPress = ( ) => handlePress( item );

  const photo = item?.observationPhotos?.[0]?.photo;

  useEffect( ( ) => {
    const openRealm = async ( ) => {
      const realm = await Realm.open( realmConfig );
      const isUnsyncedObs = Observation.isUnsyncedObservation( realm, item );
      setNeedsUpload( isUnsyncedObs );
    };
    openRealm( );
  }, [item] );

  return (
    <Pressable
      onPress={onPress}
      className="flex-row my-2 mx-3"
      testID={`ObsList.obsCard.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <Image
        source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        className="w-16 h-16 rounded-md mr-2"
        testID="ObsList.photo"
      />
      <ObsCardDetails item={item} />
      {needsUpload
        ? <Avatar.Icon size={40} icon="arrow-up-circle-outline" />
        : <ObsCardStats item={item} type="list" />}
    </Pressable>
  );
};

export default ObsCard;
