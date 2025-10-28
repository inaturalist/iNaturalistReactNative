import { Realm } from "@realm/react";

class Flag extends Realm.Object {
  static FLAG_FIELDS = {
    id: true,
    comment: true,
    created_at: true,
    flag: true,
    flaggable_content: true,
    flaggable_id: true,
    flaggable_type: true,
    resolved: true,
    uuid: true
  };

  static schema = {
    name: "Flag",
    embedded: true,
    properties: {
      created_at: "string?",
      id: "int",
      comment: "string?",
      flag: "string",
      flaggable_content: "string?",
      flaggable_id: "int?",
      flaggable_type: "string?",
      resolved: "bool",
      uuid: "string?"
    }
  };
}

export default Flag;
