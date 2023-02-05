// @flow

import {
  Image, Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import classnames from 'classnames'
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";
import UploadButton from "./UploadButton";

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

  const imageUri = uri === "project"
    ? Observation.projectUri( item )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  const showStats = ( ) => {
    if ( uri !== "project" && item.needsSync( ) ) {
      return (
        <View className="absolute bottom-0 right-0">
          <UploadButton observation={item} />
        </View>
      );
    }
    const showUpload = uri !== "project" && item.needsSync( )
    return (
      <View className={classnames(
        "absolute bottom-0",
        {
          "right-0": showUpload
        }
      )}>
        { showUpload ?
            <UploadButton observation={item} /> :
            <ObsCardStats item={item} layout="grid" />
        }
      </View>
    )
  };

  return (
    <Pressable
      onPress={onPress}
      className={`w-1/2 px-4 py-2 ${( index || 0 ) % ( numColumns || 2 ) === 0 ? "pr-2" : "pl-2"}`}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <View className="relative">
        {
          imageUri && imageUri.uri
            ? (
              <Image
                source={imageUri}
                className="grow aspect-square"
                testID="ObsList.photo"
              />
            )
            : (
              <View className="grow aspect-square justify-center items-center">
                <IconMaterial name="image-not-supported" size={150} />
              </View>
            )
          }
        {hasMultiplePhotos && (
          <View className="z-100 absolute top-2 right-2">
            <IconMaterial
                // $FlowIgnore
              name={filterIconName}
              color={colors.white}
              size={22}
            />
          </View>
        )}
        {showStats( )}
      </View>
      <ObsCardDetails item={item} view="grid" />
    </Pressable>
  );
};

GridItem.defaultProps = {
  numColumns: 2
};

export default GridItem;
