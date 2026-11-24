import type { ApiSuggestion } from "api/types";
import type Taxon from "realmModels/Taxon";
import type { RealmTaxon } from "realmModels/types";

const tryToReplaceWithLocalTaxon = (
  localTaxa: ( Taxon & RealmTaxon )[],
  suggestion: ApiSuggestion,
) => {
  const localTaxon = localTaxa.find( local => local.id === suggestion.taxon.id );

  if ( localTaxon ) {
    // Copy the taxon's data out of Realm. Spreading the live object would keep
    // live references to its photos, and saving the taxon again (as each new
    // set of online suggestions does) deletes those, so reading one later
    // crashes with "Accessing object which has been invalidated or deleted"
    const localTaxonData = typeof localTaxon.toJSON === "function"
      ? localTaxon.toJSON( )
      : localTaxon;
    return {
      ...suggestion,
      taxon: {
        ...suggestion?.taxon,
        ...localTaxonData,
      },
    };
  }

  // don't do anything if there are no local suggestions
  return suggestion;
};

export default tryToReplaceWithLocalTaxon;
