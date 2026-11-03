import { Realm } from "@realm/react";
import type { ApiProjectObservationRule } from "api/types";
import type { RealmProjectObservationRule } from "realmModels/types";

// Operand details are flattened into scalars rather than linked to the Taxon,
// User, and Project models so caching rules doesn't create rows in those
// tables (e.g. an operand project showing up as a joined project)
class ProjectObservationRule extends Realm.Object {
  static mapApiToRealm( apiRule: ApiProjectObservationRule ) {
    return {
      id: apiRule.id,
      operand_id: apiRule.operand_id,
      operand_type: apiRule.operand_type,
      operator: apiRule.operator,
      place_display_name: apiRule.place?.display_name,
      project_title: apiRule.project?.title,
      // Empty when the API omits them; offline validation falls back to
      // other ancestry sources in that case
      taxon_ancestor_ids: apiRule.taxon?.ancestor_ids || [],
      taxon_name: apiRule.taxon?.name,
      taxon_preferred_common_name: apiRule.taxon?.preferred_common_name,
      taxon_rank: apiRule.taxon?.rank,
      taxon_rank_level: apiRule.taxon?.rank_level,
      user_login: apiRule.user?.login,
    };
  }

  // Rebuilds the API's nested operand shape so consumers can treat cached and
  // freshly fetched rules the same way
  static mapRealmToPojo( realmRule: RealmProjectObservationRule ) {
    const {
      id,
      operand_id: operandId,
      operand_type: operandType,
      operator,
    } = realmRule;
    const rule = {
      id,
      operand_id: operandId ?? null,
      operand_type: operandType ?? null,
      operator,
    };
    if ( operandId == null ) return rule;

    switch ( operandType ) {
      case "Taxon":
        return {
          ...rule,
          taxon: {
            ancestor_ids: Array.from( realmRule.taxon_ancestor_ids ),
            id: operandId,
            name: realmRule.taxon_name,
            preferred_common_name: realmRule.taxon_preferred_common_name,
            rank: realmRule.taxon_rank,
            rank_level: realmRule.taxon_rank_level,
          },
        };
      case "Place":
        return {
          ...rule,
          place: { display_name: realmRule.place_display_name, id: operandId },
        };
      case "User":
        return { ...rule, user: { id: operandId, login: realmRule.user_login } };
      case "Project":
        return { ...rule, project: { id: operandId, title: realmRule.project_title } };
      default:
        return rule;
    }
  }

  static schema = {
    name: "ProjectObservationRule",
    embedded: true,
    properties: {
      id: "int",
      operand_id: "int?",
      operand_type: "string?",
      operator: "string",
      place_display_name: "string?",
      project_title: "string?",
      taxon_ancestor_ids: "int[]",
      taxon_name: "string?",
      taxon_preferred_common_name: "string?",
      taxon_rank: "string?",
      taxon_rank_level: "float?",
      user_login: "string?",
    },
  };
}

export default ProjectObservationRule;
