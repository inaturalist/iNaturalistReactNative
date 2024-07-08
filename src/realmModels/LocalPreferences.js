import { Realm } from "@realm/react";

class LocalPreferences extends Realm.Object {
  static schema = {
    name: "LocalPreferences",
    properties: {
      last_deleted_sync_time: "date?",
      last_sync_time: "date?"
    }
  };
}

export default LocalPreferences;
