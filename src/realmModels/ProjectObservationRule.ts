import { Realm } from "@realm/react";
import type { ApiProjectObservationRule } from "api/types";
import type { RealmProjectObservationRule } from "realmModels/types";

// Operand details are flattened into scalars rather than linked to the Taxon
// table so caching rules doesn't create rows there. Place display name is
// persisted only so observed_in_place? round-trips keep a place object.
class ProjectObservationRule extends Realm.Object {
  static mapApiToRealm( apiRule: ApiProjectObservationRule ) {
    return {
      id: apiRule.id,
      operand_id: apiRule.operand_id,
      operator: apiRule.operator,
      place_display_name: apiRule.place?.display_name,
      // Empty when the API omits them; offline validation falls back to
      // other ancestry sources in that case
      taxon_ancestor_ids: apiRule.taxon?.ancestor_ids || [],
      taxon_default_photo_url: apiRule.taxon?.default_photo?.url,
      taxon_name: apiRule.taxon?.name,
      taxon_preferred_common_name: apiRule.taxon?.preferred_common_name,
      taxon_rank: apiRule.taxon?.rank,
      taxon_rank_level: apiRule.taxon?.rank_level,
    };
  }

  // Rebuilds the API's nested operand shape so consumers can treat cached and
  // freshly fetched rules the same way. Operand kind is inferred from operator.
  static mapRealmToPojo( realmRule: RealmProjectObservationRule ) {
    const {
      id,
      operand_id: operandId,
      operator,
    } = realmRule;
    const rule = {
      id,
      operand_id: operandId ?? null,
      operator,
    };
    if ( operandId == null ) return rule;

    switch ( operator ) {
      case "in_taxon?":
        return {
          ...rule,
          taxon: {
            ancestor_ids: Array.from( realmRule.taxon_ancestor_ids ),
            ...( realmRule.taxon_default_photo_url && {
              default_photo: { url: realmRule.taxon_default_photo_url },
            } ),
            id: operandId,
            name: realmRule.taxon_name,
            preferred_common_name: realmRule.taxon_preferred_common_name,
            rank: realmRule.taxon_rank,
            rank_level: realmRule.taxon_rank_level,
          },
        };
      case "observed_in_place?":
        return {
          ...rule,
          place: { display_name: realmRule.place_display_name, id: operandId },
        };
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
      operator: "string",
      place_display_name: "string?",
    },
  };
}

export default ProjectObservationRule;
