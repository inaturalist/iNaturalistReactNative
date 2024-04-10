// @flow

import {
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useTheme } from "react-native-paper";
import { useTaxonSearch, useTranslation } from "sharedHooks";
import { getShadowStyle } from "styles/global";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const TaxonSearch = ( ): Node => {
  const theme = useTheme();
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const taxonList = useTaxonSearch( taxonQuery );
  const { t } = useTranslation( );

  useNavigateWithTaxonSelected( selectedTaxon, { vision: false } );

  const renderFooter = useCallback( ( ) => <View className="pb-10" />, [] );

  const renderTaxonResult = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      accessibilityLabel={t( "Choose-taxon" )}
      taxon={taxon}
      handleCheckmarkPress={() => setSelectedTaxon( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
      fetchRemote={false}
    />
  ), [setSelectedTaxon, t] );

  return (
    <ViewWrapper>
      <AddCommentPrompt />
      <CommentBox />
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={getShadow( theme.colors.primary )}
      >
        <SearchBar
          handleTextChange={setTaxonQuery}
          value={taxonQuery}
          testID="SearchTaxon"
          autoFocus={taxonQuery === ""}
        />
      </View>

      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxonList}
        renderItem={renderTaxonResult}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
