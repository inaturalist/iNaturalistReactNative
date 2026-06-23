import { Realm } from "@realm/react";

class Project extends Realm.Object {
  static schema = {
    name: "Project",
    primaryKey: "id",
    properties: {
      icon: "string?",
      id: "int",
      projectObservationFields: "ProjectObservationField[]",
      project_type: "string?",
      title: "string?",
    },
  };
}

export default Project;
