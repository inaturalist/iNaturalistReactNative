import { Realm } from "@realm/react";
import type { ApiProjectObservationField } from "api/types";
import ObservationField from "realmModels/ObservationField";

class ProjectObservationField extends Realm.Object {
  static mapApiToRealm( apiPof: ApiProjectObservationField ) {
    if ( !apiPof ) return apiPof;

    const localPof = {
      ...apiPof,
      obsField: ObservationField.mapApiToRealm( apiPof.observation_field ),
    };

    return localPof;
  }

  static schema = {
    name: "ProjectObservationField",
    embedded: true,
    properties: {
      id: "int",
      obsField: "ObservationField?",
      position: "int",
      required: "bool",
    },
  };
}

export default ProjectObservationField;
