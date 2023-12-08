// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body3, Button, ScrollViewWrapper
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import Attribution from "./Attribution";
import CommentBox from "./CommentBox";
import ObsPhotoSelectionList from "./ObsPhotoSelectionList";
import SuggestionsList from "./SuggestionsList";

type Props = {
  comment: string,
  loadingSuggestions: boolean,
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  setSelectedPhotoUri: Function,
  synced: boolean
};

const Suggestions = ( {
  comment,
  loadingSuggestions,
  nearbySuggestions,
  onTaxonChosen,
  photoUris,
  selectedPhotoUri,
  setSelectedPhotoUri,
  synced
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;

  return (
    <ScrollViewWrapper testID="suggestions">
      <AddCommentPrompt synced={synced} />
      <View className="mx-5">
        <ObsPhotoSelectionList
          photoUris={photoUris}
          selectedPhotoUri={selectedPhotoUri}
          setSelectedPhotoUri={setSelectedPhotoUri}
        />
        <Body3 className="my-4 mx-3">{t( "Select-the-identification-you-want-to-add" )}</Body3>
        <Button
          text={t( "SEARCH-FOR-A-TAXON" )}
          onPress={( ) => navigation.navigate( "TaxonSearch", { lastScreen } )}
          accessibilityLabel={t( "Search" )}
        />
      </View>
      <CommentBox comment={comment} />
      <SuggestionsList
        nearbySuggestions={nearbySuggestions}
        onTaxonChosen={onTaxonChosen}
        loadingSuggestions={loadingSuggestions}
      />
      {nearbySuggestions?.length > 0 && (
        <Attribution
          taxonIds={nearbySuggestions.map(
            suggestion => suggestion.taxon.id
          )}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default Suggestions;
