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
  const { taxa, isLoading, isLocal } = useTaxonSearch( taxonQuery );
  const { t } = useTranslation( );

  const navigateWithTaxonSelected = useNavigateWithTaxonSelected( { vision: true } );

  const renderTaxonResult = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      accessibilityLabel={t( "Choose-taxon" )}
      fetchRemote={false}
      first={index === 0}
      handleCheckmarkPress={() => navigateWithTaxonSelected( taxon )}
      hideNavButtons
      taxon={taxon}
      testID={`Search.taxa.${taxon.id}`}
    />
  ), [navigateWithTaxonSelected, t] );

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
