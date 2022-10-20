// @flow

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import ViewNoFooter from "components/SharedComponents/ViewNoFooter";
import { Text } from "components/styledComponents";
import * as React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Pressable,
  TextInput as NativeTextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  Button, Headline, TextInput
} from "react-native-paper";
import uuid from "react-native-uuid";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import colors from "styles/colors";
import { textStyles, viewStyles } from "styles/obsDetails/addID";

import AddIDHeader from "./AddIDHeader";

type Props = {
  route: {
    params: {
      onIDAdded: ( identification: {[string]: any} ) => void,
      goBackOnSave: boolean,
      hideComment: boolean
    }
  }
}

const SearchTaxonIcon = (
  <TextInput.Icon
    name={() => <IconMaterial style={textStyles.taxonSearchIcon} name="search" size={25} />}
  />
);

const AddID = ( { route }: Props ): React.Node => {
  const { t } = useTranslation( );
  const [comment, setComment] = useState( "" );
  const [commentDraft, setCommentDraft] = useState( "" );
  const { onIDAdded, goBackOnSave, hideComment } = route.params;
  const bottomSheetModalRef = useRef( null );
  const [taxonSearch, setTaxonSearch] = useState( "" );
  const {
    data: taxonList
  } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonSearch],
    optsWithAuth => fetchSearchResults( {
      q: taxonSearch,
      sources: "taxa",
      fields: "taxon.name,taxon.preferred_common_name,taxon.default_photo.square_url,taxon.rank"
    }, optsWithAuth )
  );

  const navigation = useNavigation( );

  const renderBackdrop = props => (
    <BottomSheetBackdrop
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      pressBehavior="close"
      appearsOnIndex={0}
      disappearsOnIndex={-1}
    />
  );

  const editComment = ( ) => {
    setCommentDraft( comment );
    bottomSheetModalRef.current?.present();
  };

  const createPhoto = photo => ( {
    id: photo.id,
    url: photo.square_url
  } );

  const createID = taxon => {
    const newTaxon = {
      id: taxon.id,
      default_photo: taxon.default_photo ? createPhoto( taxon.default_photo ) : null,
      name: taxon.name,
      preferred_common_name: taxon.preferred_common_name,
      rank: taxon.rank
    };
    const newID = {
      uuid: uuid.v4( ),
      body: comment,
      taxon: newTaxon
    };

    return newID;
  };

  const renderTaxonResult = ( { item } ) => {
    const taxonImage = item.default_photo
      ? { uri: item.default_photo.square_url }
      : IconMaterial.getImageSourceSync( "spa", 50, colors.inatGreen );

    return (
      <View style={viewStyles.taxonResult} testID={`Search.taxa.${item.id}`}>
        <Image
          style={viewStyles.taxonResultIcon}
          source={taxonImage}
          testID={`Search.taxa.${item.id}.photo`}
        />
        <View style={viewStyles.taxonResultNameContainer}>
          <Text style={textStyles.taxonResultName}>{item.name}</Text>
          <Text style={textStyles.taxonResultScientificName}>{item.preferred_common_name}</Text>
        </View>
        <Pressable
          style={viewStyles.taxonResultInfo}
          onPress={() => navigation.navigate( "TaxonDetails", { id: item.id } )}
          accessibilityRole="link"
        >
          <IconMaterial style={textStyles.taxonResultInfoIcon} name="info-outline" size={25} />
        </Pressable>
        <Pressable
          style={viewStyles.taxonResultSelect}
          onPress={( ) => {
            onIDAdded( createID( item ) );
            if ( goBackOnSave ) { navigation.goBack(); }
          }}
          accessibilityRole="link"
        >
          <IconMaterial style={textStyles.taxonResultSelectIcon} name="check" size={25} />
        </Pressable>
      </View>
    );
  };

  return (
    <BottomSheetModalProvider>
      <ViewNoFooter>
        <AddIDHeader
          showEditComment={!hideComment && comment.length === 0}
          onEditCommentPressed={editComment}
        />
        <View>
          <View style={viewStyles.scrollView}>
            {comment.length > 0 && (
            <View>
              <Text>{t( "ID-Comment" )}</Text>
              <View style={viewStyles.commentContainer}>
                <IconMaterial style={textStyles.commentLeftIcon} name="textsms" size={25} />
                <Text style={textStyles.comment}>{comment}</Text>
                <Pressable
                  style={viewStyles.commentRightIconContainer}
                  onPress={editComment}
                  accessibilityRole="link"
                >
                  <IconMaterial style={textStyles.commentRightIcon} name="edit" size={25} />
                </Pressable>
              </View>
            </View>
            )}
            <Text className="color-grayText">
              {t( "Search-for-a-taxon-to-add-an-identification" )}
            </Text>
            <TextInput
              testID="SearchTaxon"
              left={SearchTaxonIcon}
              style={viewStyles.taxonSearch}
              value={taxonSearch}
              onChangeText={setTaxonSearch}
              selectionColor={colors.black}
            />
            <FlatList
              data={taxonList}
              renderItem={renderTaxonResult}
              keyExtractor={item => item.id}
              style={viewStyles.taxonList}
            />
          </View>
        </View>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          enableOverDrag={false}
          enablePanDownToClose={false}
          snapPoints={["50%"]}
          backdropComponent={renderBackdrop}
          style={viewStyles.bottomModal}
        >
          <Headline style={textStyles.commentHeader}>
            {comment.length > 0 ? t( "Edit-comment" ) : t( "Add-optional-comment" )}
          </Headline>
          <View style={viewStyles.commentInputContainer}>
            <TextInput
              keyboardType="default"
              style={viewStyles.commentInput}
              value={commentDraft}
              selectionColor={colors.black}
              activeUnderlineColor={colors.transparent}
              autoFocus
              multiline
              onChangeText={setCommentDraft}
              render={innerProps => (
                <NativeTextInput
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...innerProps}
                  style={[
                    innerProps.style,
                    viewStyles.commentInputText
                  ]}
                />
              )}
            />
            <TouchableOpacity
              style={viewStyles.commentClear}
              onPress={() => setCommentDraft( "" )}
            >
              <Text
                style={[
                  viewStyles.commentClearText,
                  commentDraft.length === 0 ? textStyles.disabled : null
                ]}
              >
                {t( "Clear" )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={viewStyles.commentButtonContainer}>
            <Button
              style={viewStyles.commentButton}
              uppercase={false}
              color={colors.midGray}
              onPress={() => {
                bottomSheetModalRef.current?.dismiss();
              }}
            >
              {t( "Cancel" )}
            </Button>
            <Button
              style={viewStyles.commentButton}
              uppercase={false}
              disabled={commentDraft.length === 0}
              color={colors.midGray}
              mode="contained"
              onPress={() => {
                setComment( commentDraft );
                bottomSheetModalRef.current?.dismiss();
              }}
            >
              {comment.length > 0 ? t( "Edit-comment" ) : t( "Add-comment" )}
            </Button>
          </View>
        </BottomSheetModal>
      </ViewNoFooter>
    </BottomSheetModalProvider>
  );
};

export default AddID;
