import { Realm } from "@realm/react";
import type { ApiProjectObservationField } from "api/types";
import ObservationField from "realmModels/ObservationField";
import type { RealmProjectObservationField } from "realmModels/types";

class ProjectObservationField extends Realm.Object {
  static mapApiToRealm( apiPof: ApiProjectObservationField ) {
    if ( !apiPof ) return apiPof;

    const localPof = {
      ...apiPof,
      obsField: ObservationField.mapApiToRealm( apiPof.observation_field ),
    };

    return localPof;
  }

  static mapRealmToPojo( realmProjectObservationField: RealmProjectObservationField ) {
    return {
      id: realmProjectObservationField.id,
      obsField: realmProjectObservationField.obsField
        ? ObservationField.mapRealmToPojo( realmProjectObservationField.obsField )
        : null,
      position: realmProjectObservationField.position,
      required: realmProjectObservationField.required,
    };
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
