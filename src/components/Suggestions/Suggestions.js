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
import { useTranslation } from "sharedHooks";

import PhotoSelectionList from "./PhotoSelectionList";
import SuggestionsList from "./SuggestionsList";

type Props = {
  setComment: Function,
  comment: string,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  setSelectedPhotoUri: Function,
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function
};

const Suggestions = ( {
  photoUris, selectedPhotoUri, setSelectedPhotoUri, nearbySuggestions, onTaxonChosen,
  setComment, comment
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

    navigation.setOptions( {
      headerRight: addCommentIcon
    } );
  }, [navigation, t] );

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
      <Body3 className="mt-6 mb-4 mx-4">
        {t( "iNaturalist-Identification-suggestions-are-trained-on", {
          user1: "",
          user2: "",
          user3: ""
        } )}
      </Body3>
    </ScrollViewWrapper>
  );
};

export default Suggestions;
