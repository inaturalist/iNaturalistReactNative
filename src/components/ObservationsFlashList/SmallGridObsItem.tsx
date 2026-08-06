import { Body3, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import Photo from "realmModels/Photo";
import type { RealmObservation } from "realmModels/types";
import type { UserPojo } from "realmModels/User";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";
import { photoFromObservation } from "./util";

interface Props {
  currentUser: UserPojo | null;
  height: number;
  // since this isn't rendered from the Explore tab, there's no apiObservation case to account for;
  // it should always be a mapped Realm observation.
  observation: RealmObservation;
  onUploadButtonPress: ( ) => void;
  queued: boolean;
  uploadProgress?: number;
  width: number;
}

const SmallGridObsItem = ( {
  currentUser,
  height,
  observation,
  onUploadButtonPress,
  queued,
  uploadProgress,
  width,
}: Props ) => {
  const photo = photoFromObservation( observation );
  const photoUri = Photo.displayLocalOrRemoteMediumPhoto( photo );
  const { taxon } = observation;

  return (
    <ObsImagePreview
      iconicTaxonName={taxon?.iconic_taxon_name}
      className="rounded-none"
      source={photoUri
        ? { uri: photoUri }
        : undefined}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ width, height }}
      useShortGradient
      white
    >
      <View className="absolute bottom-0 items-start p-2">
        <ObsUploadStatus
          classNameMargin="mb-1"
          layout="horizontal"
          observation={observation}
          onPress={onUploadButtonPress}
          progress={uploadProgress}
          queued={queued}
          white
        />
        <DisplayTaxonName
          color="text-white"
          ellipsizeCommonName
          layout="vertical"
          prefersCommonNames={currentUser?.prefers_common_names}
          scientificNameFirst={currentUser?.prefers_scientific_name_first}
          showOneNameOnly
          taxon={taxon}
          topTextComponent={Body3}
        />
      </View>
    </ObsImagePreview>
  );
};

export default SmallGridObsItem;
