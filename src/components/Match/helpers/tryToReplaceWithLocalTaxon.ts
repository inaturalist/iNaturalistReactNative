import type { ApiSuggestion } from "api/types";
import type Taxon from "realmModels/Taxon";
import type { RealmTaxon } from "realmModels/types";

const tryToReplaceWithLocalTaxon = (
  localTaxa: ( Taxon & RealmTaxon )[],
  suggestion: ApiSuggestion,
) => {
  const localTaxon = localTaxa.find( local => local.id === suggestion.taxon.id );

  if ( localTaxon ) {
    return {
      ...suggestion,
      taxon: {
        ...suggestion?.taxon,
        ...localTaxon,
      },
    };
  }

  // don't do anything if there are no local suggestions
  return suggestion;
};

export default tryToReplaceWithLocalTaxon;
