// @flow

import classnames from "classnames";
<<<<<<< HEAD
import { Image, Pressable, View } from "components/styledComponents";
=======
import {
  Image, Pressable, View
} from "components/styledComponents";
>>>>>>> dc4a759 (Base for obs grid component)
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

<<<<<<< HEAD
import ObsCardDetails from "./ObsCardDetails";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";
=======
// import ObsCardDetails from "./ObsCardDetails";
// import ObsCardStats from "./ObsCardStats";
// import UploadButton from "./UploadButton";
>>>>>>> dc4a759 (Base for obs grid component)

type Props = {
  // position of this item in a list of items; not ideal, but it allows us to
  // style grids appropriately
  index?: number,
  item: Object,
  handlePress: Function,
  // Number of columns in the grid; we need this to set the margins correctly
  numColumns?: number,
  uri?: string,
};

const GridItem = ( {
  handlePress,
  // index,
  item,
  // numColumns,
  uri
}: Props ): Node => {
  const onPress = () => handlePress( item );
  console.log( item );
  const photo = item?.observationPhotos?.[0]?.photo;

  const totalObsPhotos = item?.observationPhotos?.length;
  const hasMultiplePhotos = totalObsPhotos > 1;
  const hasSound = !!item?.observationSounds?.length;
  const filterIconName = totalObsPhotos > 9 ? "filter-9-plus" : `filter-${totalObsPhotos || 2}`;

  const imageUri = uri === "project"
    ? Observation.projectUri( item )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  // const showStats = () => {
  //   if ( uri !== "project" && item.needsSync() ) {
  //     return (
  //       <View className="absolute bottom-0 right-0">
  //         <UploadButton observation={item} />
  //       </View>
  //     );
  //   }
  //  return <ObsStatus
    //   observation={item}
    //   layout="horizontal"
    //   color={colors.white}
    // />
  // };

  return (
    <Pressable
      onPress={onPress}
      className="h-[172px] w-[172px] rounded-[17px] overflow-hidden"
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <View className="rounded-[17px] overflow-hidden relative">
        {imageUri && imageUri.uri ? (
          <Image
            source={imageUri}
            className="grow aspect-square"
            testID="ObsList.photo"
          />
        ) : (
          <View className="grow aspect-square justify-center items-center">
            <IconMaterial name="image-not-supported" size={150} />
          </View>
        )}

        <View className="z-100 h-[172px] w-[172px] absolute flex justify-between p-2">
          <View className={
              classnames(
                "flex justify-between",
                {
                  "flex-row-reverse": hasMultiplePhotos
                }
              )
}
          >
            {
                hasMultiplePhotos
                && (
                <IconMaterial
                  // $FlowIgnore
                  name={filterIconName}
                  color={colors.white}
                  size={22}
                />
                )
              }
            {
            hasSound && (
            <IconMaterial
              name="volume-up"
              color={colors.white}
              size={22}
            />
            )
            }

          </View>

        </View>

      </View>

    </Pressable>
  );
};

GridItem.defaultProps = {
  numColumns: 2
};

export default GridItem;
