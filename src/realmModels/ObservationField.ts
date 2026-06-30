import { Realm } from "@realm/react";
import type { ApiObservationField } from "api/types";

const splitAllowedValues = ( allowedValues: string | null ): string[] => {
  if ( !allowedValues ) return [];
  return allowedValues.split( "|" );
};

class ObservationField extends Realm.Object {
  static mapApiToRealm( apiOf: ApiObservationField ) {
    if ( !apiOf ) return apiOf;

    const localOf = {
      ...apiOf,
      // Allowed values is a string of a pipe-separated list
      allowedValues: splitAllowedValues( apiOf.allowed_values ),
    };

    return localOf;
  }

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
