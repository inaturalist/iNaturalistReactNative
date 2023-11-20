import { Realm } from "@realm/react";

class LocalPreferences extends Realm.Object {
  static schema = {
    name: "LocalPreferences",
    properties: {
      last_sync_time: "date?"
    }
  };
}

export default LocalPreferences;
