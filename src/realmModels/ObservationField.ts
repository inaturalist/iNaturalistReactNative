import { Realm } from "@realm/react";

class ObservationField extends Realm.Object {
  static schema = {
    name: "ObservationField",
    embedded: true,
    properties: {
      allowedValues: "string[]",
      datatype: "string?",
      description: "string?",
      id: "int",
      name: "string?",
    },
  };
}

export default ObservationField;
