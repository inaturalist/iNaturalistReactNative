// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body3, INatIcon, TextInputSheet, ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  IconButton
} from "react-native-paper";
import { useTranslation } from "sharedHooks";

import TaxonSearch from "./TaxonSearch";

type Props = {
  setComment: Function,
  comment: string,
  clearSearch: boolean,
  createId: Function,
  loading: boolean
};

const AddID = ( {
  setComment, comment, clearSearch, createId, loading
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showAddCommentSheet, setShowAddCommentSheet] = useState( false );

  const navigation = useNavigation();

  useEffect( ( ) => {
    const addCommentIcon = ( ) => (
      <IconButton
        icon="add-comment-outline"
        onPress={( ) => setShowAddCommentSheet( true )}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t( "Add-comment" )}
        accessibilityState={{ disabled: false }}
      />
    );

    navigation.setOptions( {
      headerRight: addCommentIcon
    } );
  }, [navigation, t] );

  return (
    <ViewWrapper>
      {showAddCommentSheet && (
        <TextInputSheet
          handleClose={( ) => setShowAddCommentSheet( false )}
          headerText={t( "ADD-OPTIONAL-COMMENT" )}
          snapPoints={[416]}
          confirm={textInput => setComment( textInput )}
        />
      )}
      <View>
        { comment && comment.length > 0 && (
          <View className="bg-lightGray mx-6 p-5 rounded-lg flex-row items-center">
            <INatIcon
              name="comments-outline"
              size={22}
            />
            <Body3 className="ml-4 shrink">{ comment }</Body3>
          </View>
        ) }
        {loading && (
          <View
            className="absolute self-center z-10 pt-[30px]"
            testID="AddID.ActivityIndicator"
          >
            <ActivityIndicator large />
          </View>
        )}
        <TaxonSearch clearSearch={clearSearch} createId={createId} />
      </View>
    </ViewWrapper>
  );
};

export default AddID;
