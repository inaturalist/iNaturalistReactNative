import { Realm } from "@realm/react";

class ProjectObservationField extends Realm.Object {
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
