// @flow

import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Avatar } from "react-native-paper";
import Realm from "realm";
import { viewStyles } from "styles/sharedComponents/observationViews/obsCard";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";
import Photo from "../../../models/Photo";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  item: Object,
  handlePress: Function
}

const ObsCard = ( { item, handlePress }: Props ): Node => {
  const [needsUpload, setNeedsUpload] = useState( false );
  const onPress = ( ) => handlePress( item );
  // const needsUpload = item._synced_at === null;

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
      style={viewStyles.row}
      testID={`ObsList.obsCard.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <Image
        source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        style={viewStyles.imageBackground}
        testID="ObsList.photo"
      />
      <View style={viewStyles.obsDetailsColumn}>
        {/* TODO: fill in with actual empty states */}
        <ObsCardDetails item={item} />
      </View>
      {needsUpload
        ? <Avatar.Icon size={40} icon="arrow-up-circle-outline" />
        : <ObsCardStats item={item} type="list" />}
    </Pressable>
  );
};

export default ObsCard;
