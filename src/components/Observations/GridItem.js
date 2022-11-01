// @flow

import {
  Image, Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import FilterIcon from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  // position of this item in a list of items; not ideal, but it allows us to
  // style grids appropriately
  index?: number,
  item: Object,
  handlePress: Function,
  // Number of columns in the grid; we need this to set the margins correctly
  numColumns?: number,
  uri?: string
}

const GridItem = ( {
  handlePress,
  index,
  item,
  numColumns,
  uri
}: Props ): Node => {
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
      className={`w-1/2 px-4 py-2 ${( index || 0 ) % ( numColumns || 2 ) === 0 ? "pr-2" : "pl-2"}`}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <View>
        {
          imageUri && imageUri.uri
            ? (
              <Image
                source={imageUri}
                className="grow aspect-square"
                testID="ObsList.photo"
              />
            )
            : <View className="bg-black/50 grow aspect-square" />
        }
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

GridItem.defaultProps = {
  numColumns: 2
};

export default GridItem;
