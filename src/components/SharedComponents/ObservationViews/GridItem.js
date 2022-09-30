// @flow

import type { Node } from "react";
import React from "react";
import FilterIcon from "react-native-vector-icons/MaterialIcons";

import Observation from "../../../models/Observation";
import Photo from "../../../models/Photo";
import colors from "../../../styles/colors";
import {
  Image, Pressable, View
} from "../../styledComponents";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  item: Object,
  handlePress: Function,
  uri?: string
}

const GridItem = ( { item, handlePress, uri }: Props ): Node => {
  const onPress = ( ) => handlePress( item );

  const photo = item?.observationPhotos?.[0]?.photo;

  const totalObsPhotos = item?.observationPhotos?.length;
  const hasMultiplePhotos = totalObsPhotos > 1;
  const filterIconName = totalObsPhotos > 9
    ? "filter-9-plus"
    : `filter-${totalObsPhotos}`;

  // TODO: add fallback image when there is no uri
  const imageUri = uri === "project"
    ? Observation.projectUri( item )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  return (
    <Pressable
      onPress={onPress}
      className="px-1"
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <View>
        <Image
          source={imageUri}
          className="w-44 h-44"
          testID="ObsList.photo"
        />
        {hasMultiplePhotos && (
          <View className="z-100 absolute top-2 right-2">
            <FilterIcon
                // $FlowIgnore
              name={filterIconName}
              color={colors.white}
              size={22}
            />
          </View>
        )}
        <ObsCardStats item={item} view="grid" />
      </View>
      <ObsCardDetails item={item} view="grid" />
    </Pressable>
  );
};

export default GridItem;
