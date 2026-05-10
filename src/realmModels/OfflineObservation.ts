import { Realm } from "@realm/react";

class OfflineObservation extends Realm.Object {
  uuid!: string;

  latitude?: number;

  longitude?: number;

  taxon_name?: string;

  taxon_common_name?: string;

  iconic_taxon_name?: string;

  observed_on?: string;

  place_guess?: string;

  photo_url?: string;

  obscured?: boolean;

  static schema: Realm.ObjectSchema = {
    name: "OfflineObservation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      latitude: "double?",
      longitude: "double?",
      taxon_name: "string?",
      taxon_common_name: "string?",
      iconic_taxon_name: "string?",
      observed_on: "string?",
      place_guess: "string?",
      photo_url: "string?",
      obscured: "bool?",
    },
  };
}

export default OfflineObservation;
