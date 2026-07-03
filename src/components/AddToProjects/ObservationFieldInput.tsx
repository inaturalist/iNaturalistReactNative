import { Body1 } from "components/SharedComponents";
import React from "react";
import type { RealmObservationField } from "realmModels/types";

interface Props {
  observationField: RealmObservationField;
}
const ObservationFieldInput = ( { observationField }: Props ) => (
  <Body1>{observationField?.name}</Body1>
);

export default ObservationFieldInput;
