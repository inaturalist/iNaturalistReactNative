import { Realm } from "@realm/react";
import type { ProjectRulePreference as ApiProjectRulePreference } from "api/types";
import type { RealmProjectRulePreference } from "realmModels/types";

class ProjectRulePreference extends Realm.Object {
  static mapApiToRealm( apiRulePreference: ApiProjectRulePreference ) {
    return {
      field: apiRulePreference.field,
      value: apiRulePreference.value,
    };
  }

  static mapRealmToPojo( realmRulePreference: RealmProjectRulePreference ) {
    return {
      field: realmRulePreference.field,
      value: realmRulePreference.value ?? null,
    };
  }

  static schema = {
    name: "ProjectRulePreference",
    embedded: true,
    properties: {
      field: "string",
      value: "string?",
    },
  };
}

export default ProjectRulePreference;
