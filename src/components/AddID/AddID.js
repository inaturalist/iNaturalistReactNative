// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body2, Heading4, TextInputSheet, ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  IconButton
} from "react-native-paper";
import uuid from "react-native-uuid";
import useTranslation from "sharedHooks/useTranslation";

import TaxonSearch from "./TaxonSearch";

type Props = {
  route: {
    params: {
      onIDAdded: ( identification: { [string]: any } ) => void,
      goBackOnSave: boolean,
      hideComment: boolean,
      clearSearch: boolean
    },
  },
};

const AddID = ( { route }: Props ): Node => {
  const { t } = useTranslation( );
  const [showAddCommentSheet, setShowAddCommentSheet] = useState( false );
  const [comment, setComment] = useState( "" );
  const { onIDAdded, goBackOnSave } = route.params;

  const navigation = useNavigation();

  const createPhoto = photo => ( {
    id: photo.id,
    url: photo.square_url
  } );

  const createIdentification = taxon => {
    const newTaxon = {
      ...taxon,
      default_photo: taxon.default_photo
        ? createPhoto( taxon.default_photo )
        : null
    };
    const newIdent = {
      uuid: uuid.v4(),
      body: comment,
      taxon: newTaxon
    };

    return newIdent;
  };

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

    const renderHeaderTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;

    navigation.setOptions( {
      headerRight: addCommentIcon,
      headerTitle: renderHeaderTitle
    } );
  }, [navigation, t] );

  const createId = taxon => {
    onIDAdded( createIdentification( taxon ) );
    if ( goBackOnSave ) {
      navigation.goBack( );
    }
  };

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
        <TaxonSearch route={route} createId={createId} />
        <Body2 className="self-center">
          {t( "Search-for-a-taxon-to-add-an-identification" )}
        </Body2>
      </View>
    </ViewWrapper>
  );
};

export default AddID;
