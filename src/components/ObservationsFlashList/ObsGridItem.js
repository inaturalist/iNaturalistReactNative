// @flow

import { Body2, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";
import {
  photoFromObservation,
} from "./util";

const { useObject } = RealmContext;

type Props = {
  // currentUser: Object,
  explore: boolean,
  height?: string,
  hideObsUploadStatus?: boolean,
  observationUuid: string,
  onUploadButtonPress: Function,
  style?: Object,
  queued: boolean,
  uploadProgress?: number,
  width?: string,
  testID?: string
};

const useObservation = uuid => {
  const observation = useObject( "Observation", uuid );
  return observation;
  // return useMemo(
  //   () => Observation.mapObservationForMyObsDefaultMode( observation ),
  //   [observation],
  // );
};

const ObsGridItem = ( {
  // currentUser,
  explore,
  height = "w-[200px]",
  hideObsUploadStatus,
  observationUuid,
  onUploadButtonPress,
  queued,
  style,
  uploadProgress,
  testID,
  width = "w-[200px]",
}: Props ): Node => {
  const observation = useObservation( observationUuid );

  const photo = photoFromObservation( observation );

  return (
    <ObsImagePreview
      source={{
        uri: Photo.displayLocalOrRemoteMediumPhoto( photo ),
      }}
      width={width}
      height={height}
      style={style}
      // obsPhotosCount={10}
      // obsPhotosCount={photoCountFromObservation( observation )}
      // hasSound={observationHasSound( observation )}
      isMultiplePhotosTop
      testID={testID || `MyObservations.obsGridItem.${observation.uuid}`}
      useShortGradient={!explore}
      iconicTaxonName={observation.taxon?.iconic_taxon_name}
      white
    >
      <View className="absolute bottom-0 items-start p-2">
        {!hideObsUploadStatus && (
          <ObsUploadStatus
            classNameMargin="mb-1"
            explore={explore}
            layout="horizontal"
            observation={observation}
            onPress={onUploadButtonPress}
            queued={queued}
            progress={uploadProgress}
            white
          />
        )}
        <DisplayTaxonName
          bottomTextComponent={Body2}
          color="text-white"
          ellipsizeCommonName
          keyBase={observation?.uuid}
          layout="vertical"
          // prefersCommonNames={currentUser?.prefers_common_names}
          // scientificNameFirst={currentUser?.prefers_scientific_name_first}
          showOneNameOnly
          // taxon={observation?.taxon}
        />
      </View>
    </ObsImagePreview>
  );
};

export default ObsGridItem;
