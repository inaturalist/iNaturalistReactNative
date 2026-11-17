import { Realm } from "@realm/react";
import type { ApiProjectObservationRule } from "api/types";
import Taxon from "realmModels/Taxon";
import type { RealmProjectObservationRule } from "realmModels/types";

// Place display name is persisted only so observed_in_place? round-trips keep a place object.
// Embedded objects cannot link to top-level Taxon rows. Persist taxa required for in_taxon?
// operands as operand_id (and in realm).
class ProjectObservationRule extends Realm.Object {
  static mapApiToRealm( apiRule: ApiProjectObservationRule ) {
    return {
      id: apiRule.id,
      operand_id: apiRule.operand_id,
      operator: apiRule.operator,
      place_display_name: apiRule.place?.display_name,
    };
  }

  // Rebuilds the API's nested operand shape so consumers can treat cached and
  // freshly fetched rules the same way. Operand kind is inferred from operator.
  static mapRealmToPojo(
    realmRule: RealmProjectObservationRule,
    realm: Realm,
  ) {
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
      case "in_taxon?": {
        const realmTaxon = realm.objectForPrimaryKey( "Taxon", operandId );
        const taxon = realmTaxon
          ? Taxon.mapRealmToPojo( realmTaxon )
          : { id: operandId };
        return {
          ...rule,
          taxon,
        };
      }
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
