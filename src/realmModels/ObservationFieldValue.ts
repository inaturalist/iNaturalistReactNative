import { Realm } from "@realm/react";
import type { ApiObservationFieldValue } from "api/types";
import type { RealmObservation, RealmObservationFieldValue } from "realmModels/types";
import * as uuid from "uuid";

class ObservationFieldValue extends Realm.Object {
  _created_at?: Date;

  _synced_at?: Date;

  _updated_at?: Date;

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static new(
    obsFieldId: number,
    value?: string,
  ) {
    return {
      _created_at: new Date( ),
      _updated_at: new Date( ),
      uuid: uuid.v4( ).toLowerCase( ),
      obsFieldId,
      value,
    };
  }

  static findForObsField(
    observation: RealmObservation,
    obsFieldId: number,
  ): RealmObservationFieldValue | undefined {
    return observation.observationFieldValues.find(
      ofv => ofv.obsFieldId === obsFieldId,
    );
  }

  static mapApiToRealm(
    apiOfv: ApiObservationFieldValue,
  ) {
    const localOfv = {
      ...apiOfv,
      obsFieldId: apiOfv.observation_field.id,
      _synced_at: new Date( ),
    };
    return localOfv;
  }

  static schema = {
    name: "ObservationFieldValue",
    embedded: true,
    properties: {
      // datetime the OFV was created on the device
      _created_at: "date?",
      // datetime the OFV was last synced with the server
      _synced_at: "date?",
      // datetime the OFV was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      id: "int?",
      obsFieldId: "int",
      value: "string?",
      // this creates an inverse relationship so OFVs
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationFieldValues",
      },
    },
  };
}

export default ObservationFieldValue;
