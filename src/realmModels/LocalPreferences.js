import { Realm } from "@realm/react";

class LocalPreferences extends Realm.Object {
  static schema = {
    name: "LocalPreferences",
    properties: {
      last_deleted_sync_time: "date?",
      last_sync_time: "date?",
      explore_location_permission_shown: { type: "bool", default: false }
    }
  };
}

export default LocalPreferences;
