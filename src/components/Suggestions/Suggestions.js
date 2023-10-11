// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body3, Button, INatIcon,
  INatIconButton, ScrollViewWrapper,
  TextInputSheet
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator
} from "react-native-paper";
import { useTranslation } from "sharedHooks";

import Attribution from "./Attribution";
import PhotoSelectionList from "./PhotoSelectionList";
import SuggestionsList from "./SuggestionsList";

type Props = {
  setComment: Function,
  comment: string,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  setSelectedPhotoUri: Function,
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function,
  wasSynced: boolean,
  loading: boolean
};

const Suggestions = ( {
  photoUris, selectedPhotoUri, setSelectedPhotoUri, nearbySuggestions, onTaxonChosen,
  setComment, comment, wasSynced, loading
}: Props ): Node => {
  const [showAddCommentSheet, setShowAddCommentSheet] = useState( false );

  const { t } = useTranslation( );
  const navigation = useNavigation( );

  useEffect( ( ) => {
    const addCommentIcon = ( ) => (
      <INatIconButton
        icon="edit-comment"
        onPress={( ) => setShowAddCommentSheet( true )}
        accessibilityLabel={t( "Add-comment" )}
        size={25}
      />
    );

    if ( wasSynced ) {
      navigation.setOptions( {
        headerRight: addCommentIcon
      } );
    }
  }, [navigation, t, wasSynced] );

  return (
    <ScrollViewWrapper>
      {showAddCommentSheet && (
        <TextInputSheet
          handleClose={( ) => setShowAddCommentSheet( false )}
          headerText={t( "ADD-OPTIONAL-COMMENT" )}
          snapPoints={[416]}
          confirm={textInput => setComment( textInput )}
        />
      )}
      {loading && (
        <View
          className="absolute self-center z-10 pt-[30px]"
          testID="Suggestions.ActivityIndicator"
        >
          <ActivityIndicator large />
        </View>
      )}
      <View className="mx-5">
        <PhotoSelectionList
          photoUris={photoUris}
          selectedPhotoUri={selectedPhotoUri}
          setSelectedPhotoUri={setSelectedPhotoUri}
        />
        <Body3 className="my-4 mx-3">{t( "Select-the-identification-you-want-to-add" )}</Body3>
        <Button
          text={t( "SEARCH-FOR-A-TAXON" )}
          onPress={( ) => navigation.navigate( "TaxonSearch" )}
          accessibilityLabel={t( "Search" )}
        />
      </View>
      { comment && comment.length > 0 && (
        <>
          <Body3 className="my-5 mx-8">
            {t( "Your-identification-will-be-posted-with-the-following-comment" )}
          </Body3>
          <View className="bg-lightGray mx-6 p-5 rounded-lg flex-row items-center">
            <INatIcon
              name="add-comment-outline"
              size={22}
            />
            <Body3 className="ml-4 shrink">{ comment }</Body3>
          </View>
        </>
      ) }
      <SuggestionsList
        nearbySuggestions={nearbySuggestions}
        onTaxonChosen={onTaxonChosen}
      />
      {nearbySuggestions?.length > 0 && (
        <Attribution
          taxonIds={nearbySuggestions.map( suggestion => suggestion.taxon.id )}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default Suggestions;
