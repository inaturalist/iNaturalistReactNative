// @flow

import {
  SearchBar,
  TaxaList,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useTaxonSearch, useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

const TaxonSearch = ( ): Node => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const { taxaSearchResults, isLoading } = useTaxonSearch( taxonQuery );
  const { t } = useTranslation( );

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: false }
  );

  const renderFooter = useCallback( ( ) => <View className="pb-20" />, [] );

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
    <ViewWrapper>
      <AddCommentPrompt />
      <CommentBox />
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setTaxonQuery}
          value={taxonQuery}
          testID="SearchTaxon"
          autoFocus={taxonQuery === ""}
        />
      </View>
      <TaxaList
        taxa={taxaSearchResults}
        isLoading={isLoading}
        renderItem={renderTaxonResult}
        renderFooter={renderFooter}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
