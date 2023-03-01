// @flow

import classNames from "classnames";
import DisplayTaxonName from "components/DisplayTaxonName";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import MyObservationsImagePreview from "./MyObservationsImagePreview";
import MyObservationsStatus from "./MyObservationsStatus";
import MyObservationsUploadButton from "./MyObservationsUploadButton";

type Props = {
  observation: Object,
  width?: string,
};

const MyObservationsGridItem = ( {
  observation,
  width = "w-full"
}: Props ): Node => (
  <View
    className={classNames( "rounded-[17px] overflow-hidden", "h-[172px]", width )}
    testID={`MyObservations.gridItem.${observation.uuid}`}
  >
    <MyObservationsImagePreview
      source={{
        uri: Photo.displayLocalOrRemoteMediumPhoto(
          observation?.observationPhotos?.[0]?.photo
        )
      }}
      height="h-[172px]"
      width="w-full"
      obsPhotosCount={observation?.observationPhotos?.length ?? 0}
      hasSound={!!observation?.observationSounds?.length}
      isMultiplePhotosTop
    >
      <View className="absolute bottom-0 flex p-2 w-full">
        {observation.needsSync?.( ) ? (
          <MyObservationsUploadButton observation={observation} />
        ) : (
          <MyObservationsStatus
            observation={observation}
            layout="horizontal"
            white
            classNameMargin="mb-1"
          />
        )}
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={
              observation?.user?.prefers_scientific_name_first
            }
          layout="vertical"
          color="text-white"
          displaySecondName={false}
        />
      </View>
    </MyObservationsImagePreview>
  </View>
);

export default MyObservationsGridItem;
