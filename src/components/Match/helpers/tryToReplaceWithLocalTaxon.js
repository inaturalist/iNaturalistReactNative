const tryToReplaceWithLocalTaxon = ( localTaxa, suggestion ) => {
  const localTaxon = localTaxa.find( local => local.id === suggestion.taxon.id );

  if ( localTaxon ) {
    return {
      ...suggestion,
      taxon: localTaxon
    };
  }

  // don't do anything if there are no local suggestions
  return suggestion;
};

export default tryToReplaceWithLocalTaxon;
