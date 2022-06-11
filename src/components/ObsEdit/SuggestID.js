// @flow

import * as React from "react";
import {
  View,
  Pressable,
  TouchableOpacity, FlatList, Image
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import { viewStyles, textStyles } from "../../styles/obsDetails/suggestID";
import { useTranslation } from "react-i18next";
import { TextInput as NativeTextInput } from "react-native";
import SuggestIDHeader from "./SuggestIDHeader";
import {useRef, useState} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import {Button, Headline, Text, TextInput} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";

const SuggestID = ( { route } ): React.Node => {
  const { t } = useTranslation( );
  const [comment, setComment] = useState( "" );
  const [commentDraft, setCommentDraft] = useState( "" );
  const { onIDAdded } = route.params;
  const bottomSheetModalRef = useRef<BottomSheetModal>( null );
  const [taxonSearch, setTaxonSearch] = useState( "" );
  const taxonList = useRemoteSearchResults( taxonSearch, "taxa", "taxon.name,taxon.preferred_common_name,taxon.default_photo.square_url" ).map( r => r.taxon );
  const navigation = useNavigation( );

  const renderBackdrop = ( props: BottomSheetBackdropProps ) => (
    <BottomSheetBackdrop {...props} pressBehavior={"close"}
                         appearsOnIndex={0}
                         disappearsOnIndex={-1}
    />
  );

  const editComment = () => {
    setCommentDraft( comment );
    bottomSheetModalRef.current?.present();
  };

  const renderTaxonResult = ( {item} ) => {
    return <View style={viewStyles.taxonResult}>
      <Image style={viewStyles.taxonResultIcon} source={{ uri: item.default_photo.square_url }} />
      <View style={viewStyles.taxonResultNameContainer}>
      <Text style={textStyles.taxonResultName}>{item.name}</Text>
      <Text style={textStyles.taxonResultScientificName}>{item.preferred_common_name}</Text>
      </View>
      <Pressable style={viewStyles.taxonResultInfo} onPress={() => navigation.navigate( "TaxonDetails", { id: item.id } )} accessibilityRole="link"><Icon style={viewStyles.taxonResultInfoIcon} name="information-outline" size={25} /></Pressable>
      <Pressable style={viewStyles.taxonResultSelect} onPress={() => { onIDAdded( { taxon: item, comment } ); navigation.goBack(); }} accessibilityRole="link"><Icon style={viewStyles.taxonResultSelectIcon} name="check-bold" size={25} /></Pressable>
    </View>;
  };

  return (
    <BottomSheetModalProvider>
      <ViewNoFooter>
        <SuggestIDHeader showEditComment={comment.length === 0} onEditComment={editComment} />
        <View
          contentContainerStyle={viewStyles.scrollView}
        >
          <View>
            {comment.length > 0 && <View>
              <Text>{t( "Your identification will be posted with the following comment:" )}</Text>
              <View style={viewStyles.commentContainer}>
                <Icon style={viewStyles.commentLeftIcon} name="chat-processing-outline" size={25} />
                <Text style={textStyles.comment}>{comment}</Text>
                <Pressable style={viewStyles.commentRightIconContainer} onPress={editComment} accessibilityRole="link"><Icon style={viewStyles.commentRightIcon} name="pencil" size={25} /></Pressable>
              </View>
            </View>
            }
            <Text>{t( "Search for a taxon to add an identification" )}</Text>
            <TextInput
              left={<TextInput.Icon name={() => <Icon style={viewStyles.taxonSearchIcon} name={"magnify"} size={25} />} />}
              style={viewStyles.taxonSearch}
              value={taxonSearch}
              onChangeText={setTaxonSearch}
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
        >
          <Headline>{t( comment.length > 0 ? "Edit Comment" : "Add an Optional Comment to this ID" )}</Headline>
          <View style={viewStyles.commentInputContainer}>
            <TextInput
              keyboardType="default"
              style={viewStyles.commentInput}
              value={commentDraft}
              activeUnderlineColor="#ff000000"
              autoFocus
              multiline
              onChangeText={setCommentDraft}
              render={( innerProps ) => (
                <NativeTextInput
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
              onPress={() => setCommentDraft( "" )}>
              <Text
                style={commentDraft.length === 0 ? textStyles.disabled : null}>{t( "Clear" )}</Text>
            </TouchableOpacity>
          </View>

          <View style={viewStyles.commentButtonContainer}>
            <Button
              style={viewStyles.commentButton}
              uppercase={false}
              color="#cccccc"
              onPress={() => {
                bottomSheetModalRef.current?.dismiss();
              }}>{t( "Cancel" )}</Button>
            <Button
              style={viewStyles.commentButton}
              uppercase={false}
              color="#cccccc"
              mode="contained"
              onPress={() => {
                setComment( commentDraft );
                bottomSheetModalRef.current?.dismiss();
              }}>{t( comment.length > 0 ? "Edit Comment" : "Add Comment" )}</Button>
          </View>
        </BottomSheetModal>
      </ViewNoFooter>
    </BottomSheetModalProvider>
  );
};

export default SuggestID;

