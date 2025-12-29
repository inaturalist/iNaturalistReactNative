import {
  TaxonResult,
  TaxonSearch,
} from "components/SharedComponents";
import React, {
  useCallback,
  useState,
} from "react";
import { useTaxonSearch, useTranslation } from "sharedHooks";

import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";

const SuggestionsTaxonSearch = ( ) => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const { taxa, isLoading, isLocal } = useTaxonSearch( taxonQuery );
  const { t } = useTranslation( );

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: false },
  );

  const renderTaxonResult = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      accessibilityLabel={t( "Choose-taxon" )}
      fetchRemote={false}
      first={index === 0}
      handleCheckmarkPress={() => setSelectedTaxon( taxon )}
      hideNavButtons
      taxon={taxon}
      testID={`Search.taxa.${taxon.id}`}
    />
  ), [setSelectedTaxon, t] );

  return (
    <TaxonSearch
      isLoading={isLoading}
      isLocal={isLocal}
      query={taxonQuery}
      renderItem={renderTaxonResult}
      setQuery={setTaxonQuery}
      taxa={taxa}
    />
  );
};

export default SuggestionsTaxonSearch;
