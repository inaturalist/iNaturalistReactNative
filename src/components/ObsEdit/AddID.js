// @flow

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import ViewNoFooter from "components/SharedComponents/ViewNoFooter";
import * as React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Pressable, TextInput as NativeTextInput, TouchableOpacity,
  View
} from "react-native";
import {
  Button, Headline, Text, TextInput
} from "react-native-paper";
import uuid from "react-native-uuid";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "styles/colors";
import { textStyles, viewStyles } from "styles/obsDetails/addID";

import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";
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
    name={() => <Icon style={textStyles.taxonSearchIcon} name="magnify" size={25} />}
  />
);

const AddID = ( { route }: Props ): React.Node => {
  const { t } = useTranslation( );
  const [comment, setComment] = useState( "" );
  const [commentDraft, setCommentDraft] = useState( "" );
  const { onIDAdded, goBackOnSave, hideComment } = route.params;
  const bottomSheetModalRef = useRef( null );
  const [taxonSearch, setTaxonSearch] = useState( "" );
  const taxonList = useRemoteSearchResults(
    taxonSearch,
    "taxa",
    "taxon.name,taxon.preferred_common_name,taxon.default_photo.square_url,taxon.rank"
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
      : Icon.getImageSourceSync( "leaf", 50, colors.inatGreen );

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
          <Icon style={textStyles.taxonResultInfoIcon} name="information-outline" size={25} />
        </Pressable>
        <Pressable
          style={viewStyles.taxonResultSelect}
          onPress={( ) => {
            onIDAdded( createID( item ) );
            if ( goBackOnSave ) { navigation.goBack(); }
          }}
          accessibilityRole="link"
        >
          <Icon style={textStyles.taxonResultSelectIcon} name="check-bold" size={25} />
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
                <Icon style={textStyles.commentLeftIcon} name="chat-processing-outline" size={25} />
                <Text style={textStyles.comment}>{comment}</Text>
                <Pressable
                  style={viewStyles.commentRightIconContainer}
                  onPress={editComment}
                  accessibilityRole="link"
                >
                  <Icon style={textStyles.commentRightIcon} name="pencil" size={25} />
                </Pressable>
              </View>
            </View>
            )}
            <Text>{t( "Search-Taxon-ID" )}</Text>
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
