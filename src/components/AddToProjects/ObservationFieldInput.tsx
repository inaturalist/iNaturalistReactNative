import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import type { RealmObservationField } from "realmModels/types";

interface Props {
  observationField: RealmObservationField;
}
const ObservationFieldInput = ( { observationField }: Props ) => (
  <View className="px-4 py-2.5">
    <Body1>{observationField?.name}</Body1>
  </View>
);

export default ObservationFieldInput;
