import { Realm } from "@realm/react";
import * as uuid from "uuid";

class ProjectObservation extends Realm.Object {
  _created_at?: Date;

  _synced_at?: Date;

  _updated_at?: Date;

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static new( projectId: number ) {
    return {
      _created_at: new Date( ),
      _updated_at: new Date( ),
      uuid: uuid.v4( ).toLowerCase( ),
      projectId,
    };
  }

  static schema = {
    name: "ProjectObservation",
    embedded: true,
    properties: {
      // datetime the PO was created on the device
      _created_at: "date?",
      // datetime the PO was last synced with the server
      _synced_at: "date?",
      // datetime the PO was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      id: "int?",
      projectId: "int",
      // this creates an inverse relationship so POs
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "projectObservations",
      },
    },
  };
}

export default ProjectObservation;
