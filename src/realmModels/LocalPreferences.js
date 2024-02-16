import { Realm } from "@realm/react";

class LocalPreferences extends Realm.Object {
  static schema = {
    name: "LocalPreferences",
    properties: {
      last_sync_time: "date?",
      explore_location_permission_shown: { type: "bool", default: false }
    }
  };
}

export default LocalPreferences;
