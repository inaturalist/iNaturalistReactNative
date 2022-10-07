// @flow

import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Avatar } from "react-native-paper";
import { viewStyles } from "styles/sharedComponents/observationViews/obsCard";

import Observation from "../../../models/Observation";
import Photo from "../../../models/Photo";
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
