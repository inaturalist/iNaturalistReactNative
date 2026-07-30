import type { ApiTaxon } from "api/types";
import {
  SearchHeader,
  TaxonResult,
  TaxonSearch,
  ViewWrapper,
} from "components/SharedComponents";
import React, {
  useCallback,
  useState,
} from "react";
import type { RealmTaxon } from "realmModels/types";
import useTaxonSearch from "sharedHooks/useTaxonSearch";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  closeModal: ( ) => void;
  onPressInfo?: ( taxon: RealmTaxon | ApiTaxon ) => void;
  updateTaxon: ( taxon: RealmTaxon | null ) => void;
}

const ExploreTaxonSearch = ( {
  closeModal,
  onPressInfo,
  updateTaxon,
}: Props ) => {
  const { t } = useTranslation( );
  const [taxonQuery, setTaxonQuery] = useState( "" );

  const {
    taxa,
    isLoading,
    isLocal,
  } = useTaxonSearch( taxonQuery );

  const onTaxonSelected = useCallback( async ( newTaxon: RealmTaxon ) => {
    updateTaxon( newTaxon );
    closeModal();
  }, [closeModal, updateTaxon] );

  const resetTaxon = useCallback(
    ( ) => {
      updateTaxon( null );
      closeModal();
    },
    [updateTaxon, closeModal],
  );

  const renderItem = useCallback(
    // no-unused-prop-types bug
    // eslint-disable-next-line react/no-unused-prop-types
    ( { item: taxon, index }: { item: RealmTaxon; index: number } ) => (
      <TaxonResult
        first={index === 0}
        fetchRemote={false}
        handleTaxonOrEditPress={() => onTaxonSelected( taxon )}
        onPressInfo={onPressInfo}
        showCheckmark={false}
        taxon={taxon}
        testID={`Search.taxa.${taxon.id}`}
      />
    ),
    [
      onPressInfo,
      onTaxonSelected,
    ],
  );

  return (
    <ViewWrapper>
      <SearchHeader
        onClose={closeModal}
        headerText={t( "SEARCH-TAXA" )}
        onReset={resetTaxon}
        testID="ExploreTaxonSearch.close"
      />
      <TaxonSearch
        isLoading={isLoading}
        isLocal={isLocal}
        query={taxonQuery}
        renderItem={renderItem}
        setQuery={setTaxonQuery}
        taxa={taxa}
      />
    </ViewWrapper>
  );
};

export default ExploreTaxonSearch;
