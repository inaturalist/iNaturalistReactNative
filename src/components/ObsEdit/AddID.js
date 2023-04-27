// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import { TextInputSheet, ViewWrapper } from "components/SharedComponents";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import {
  IconButton,
  TextInput,
  useTheme
} from "react-native-paper";
import uuid from "react-native-uuid";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Taxon from "realmModels/Taxon";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useTranslation from "sharedHooks/useTranslation";
import { textStyles, viewStyles } from "styles/obsDetails/addID";

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

const SearchTaxonIcon = (
  <TextInput.Icon
    name={() => (
      <IconMaterial
        style={textStyles.taxonSearchIcon}
        name="search"
        size={25}
      />
    )}
    accessibilityElementsHidden
  />
);

const AddID = ( { route }: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme();
  const [showAddCommentSheet, setShowAddCommentSheet] = useState( false );
  const [comment, setComment] = useState( "" );
  const { onIDAdded, goBackOnSave } = route.params;
  const [taxonSearch, setTaxonSearch] = useState( "" );
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonSearch],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonSearch,
        sources: "taxa",
        fields: {
          taxon: Taxon.TAXON_FIELDS
        }
      },
      optsWithAuth
    )
  );

  useEffect( ( ) => {
    // this clears search whenever a user is coming from ObsEdit
    // but maintains current search when a user navigates to TaxonDetails and back
    if ( route?.params?.clearSearch ) {
      setTaxonSearch( "" );
    }
  }, [route] );

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

  const renderTaxonResult = ( { item: taxon } ) => {
    const taxonImage = taxon.default_photo
      ? { uri: taxon.default_photo.square_url }
      : IconMaterial.getImageSourceSync( "spa", 50, theme.colors.secondary );

    return (
      <View
        className="flex-row my-1 items-center justify-between"
        testID={`Search.taxa.${taxon.id}`}
      >
        <Pressable
          className="flex-row items-center w-16 grow"
          onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
          accessible
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
          accessibilityValue={{ text: taxon.name }}
          accessibilityState={{ disabled: false }}
        >
          <Image
            className="w-12 h-12 mr-1 bg-lightGray"
            source={taxonImage}
            testID={`Search.taxa.${taxon.id}.photo`}
          />
          <View className="shrink">
            <Text>{taxon.name}</Text>
            <Text>{taxon.preferred_common_name}</Text>
          </View>
        </Pressable>
        <View className="flex-row">
          <IconButton
            icon="pencil"
            size={25}
            onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
            accessibilityRole="link"
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
            accessibilityState={{ disabled: false }}
          />
          <IconButton
            icon="checkmark"
            size={25}
            iconColor={theme.colors.secondary}
            onPress={() => {
              onIDAdded( createIdentification( taxon ) );
              if ( goBackOnSave ) {
                navigation.goBack();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t( "Add-this-ID" )}
            accessibilityState={{ disabled: false }}
          />
        </View>
      </View>
    );
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
      <View className="p-3">
        <Text className="color-darkGray">
          {t( "Search-for-a-taxon-to-add-an-identification" )}
        </Text>
        <TextInput
          testID="SearchTaxon"
          left={SearchTaxonIcon}
          style={viewStyles.taxonSearch}
          value={taxonSearch}
          onChangeText={setTaxonSearch}
          selectionColor={theme.colors.tertiary}
          accessible
          accessibilityLabel={t(
            "Search-for-a-taxon-to-add-an-identification"
          )}
          accessibilityRole="search"
          accessibilityState={{ disabled: false }}
        />
        <FlatList
          keyboardShouldPersistTaps="always"
          data={taxonList}
          renderItem={renderTaxonResult}
          keyExtractor={item => item.id}
        />
      </View>
    </ViewWrapper>
  );
};

export default AddID;
