// @flow

import classnames from "classnames";
import DisplayTaxonName from "components/DisplayTaxonName";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import ObsPreviewImage from "./ObsPreviewImage";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  onPress: Function,
  uri?: string,
  height?: string,
  width?: string,
};

const ObsGridItem = ( {
  onPress,
  observation,
  uri,
  width = "w-full",
  height = "h-[172px]"
}: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo;

  const imageUri = uri === "project"
    ? Observation.projectUri( observation )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  const showStats = ( ) => {
    if ( uri !== "project" && observation.needsSync( ) ) {
      return (
        <View className="absolute bottom-0 right-0">
          <UploadButton observation={observation} />
        </View>
      );
    }
    return (
      <ObsStatus
        observation={observation}
        layout="horizontal"
        color={colors.white}
      />
    );
  };

  return (
    <Pressable
      onPress={( ) => onPress( observation )}
      className={classnames( "rounded-[17px] overflow-hidden", height, width )}
      testID={`ObsList.gridItem.${observation.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <ObsPreviewImage
        uri={imageUri}
        height="h-[172px]"
        width="w-full"
        observation={observation}
        multiplePhotosLocation="top"
      >
        <View className={classnames( "absolute bottom-0 flex p-2 w-full" )}>
          {showStats( )}
          <DisplayTaxonName
            taxon={observation?.taxon}
            scientificNameFirst={
              observation?.user?.prefers_scientific_name_first
            }
            layout="vertical"
            color="text-white"
          />
        </View>
      </ObsPreviewImage>
    </Pressable>
  );
};

export default ObsGridItem;
