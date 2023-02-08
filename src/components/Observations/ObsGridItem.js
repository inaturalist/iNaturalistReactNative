// @flow

import classnames from "classnames";
import DisplayTaxonName from "components/DisplayTaxonName";
import { ImageBackground, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import LinearGradient from "react-native-linear-gradient";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  handlePress: Function,
  uri?: string,
  height?: string,
  width?: string,
};

const ObsGridItem = ( {
  handlePress,
  observation,
  uri,
  width = "w-full",
  height = "h-[172px]"
}: Props ): Node => {
  const onPress = () => handlePress( observation );

  const photo = observation?.observationPhotos?.[0]?.photo;

  const totalObsPhotos = observation?.observationPhotos?.length;
  const hasMultiplePhotos = totalObsPhotos > 1;
  const hasSound = !!observation?.observationSounds?.length;
  const filterIconName = totalObsPhotos > 9 ? "filter-9-plus" : `filter-${totalObsPhotos || 2}`;

  const imageUri = uri === "project"
    ? Observation.projectUri( observation )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  const showStats = () => {
    if ( uri !== "project" && observation.needsSync() ) {
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
  console.log( width );
  return (
    <Pressable
      onPress={onPress}
      className={classnames( "rounded-[17px] overflow-hidden", height, width )}
      testID={`ObsList.gridItem.${observation.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <View className={classnames( "rounded-[17px] overflow-hidden relative w-full", height )}>
        {imageUri && imageUri.uri ? (
          <ImageBackground
            source={imageUri}
            className="grow aspect-square"
            testID="ObsList.photo"
          >
            <LinearGradient
              className="bg-transparent absolute inset-0"
              colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
            />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
          >
            <View className="grow aspect-square" />
          </LinearGradient>
        )}

        <View className={classnames( "z-100 absolute flex justify-between p-2 w-full", height )}>
          <View
            className={classnames( "flex justify-between", {
              "flex-row-reverse": hasMultiplePhotos
            } )}
          >
            {hasMultiplePhotos && (
              <IconMaterial
                // $FlowIgnore
                name={filterIconName}
                color={colors.white}
                size={22}
              />
            )}
            {( hasSound || true ) && (
              <IconMaterial name="volume-up" color={colors.white} size={22} />
            )}
          </View>

          <View>
            {showStats()}
            <DisplayTaxonName
              taxon={observation?.taxon}
              scientificNameFirst={
                observation?.user?.prefers_scientific_name_first
              }
              layout="vertical"
              color="text-white"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ObsGridItem;
