// @flow

import {
  BottomSheetModal, BottomSheetModalProvider,
  BottomSheetTextInput
} from "@gorhom/bottom-sheet";
import type { Node } from "react";
import React, {
  useEffect, useRef, useState
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert, Keyboard,
  TextInput as NativeTextInput, TouchableOpacity, View
} from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { textStyles, viewStyles } from "styles/obsDetails/obsDetails";
import colors from "styles/tailwindColors";

type Props = {
  createCommentMutation: Function,
  showCommentBox: boolean,
  setShowCommentBox: Function,
  setAddingComment: Function
}

const AddCommentModal = ( {
  createCommentMutation,
  showCommentBox,
  setShowCommentBox,
  setAddingComment
}: Props ): Node => {
  const { t } = useTranslation( );
  const [comment, setComment] = useState( "" );
  const bottomSheetModalRef = useRef( null );
  const [snapPoint, setSnapPoint] = useState( 100 );

  // Clear the comment in a timeout so it doesn't trigger a re-render of the
  // text input *after* the bottom sheet modal gets dismissed, b/c that seems
  // to re-render the bottom sheet in a presented state, making it hard to
  // actually dismiss
  const clearComment = ( ) => setTimeout( ( ) => setComment( "" ), 100 );

  const onBackdropPress = () => {
    Alert.alert(
      t( "Discard-Comment" ),
      t( "Are-you-sure-discard-comment" ),
      [{
        text: t( "Yes" ),
        onPress: () => {
          setShowCommentBox( false );
          // setComment( "" );
          Keyboard.dismiss();
          clearComment( );
        }
      }, { text: t( "No" ) }],
      {
        cancelable: false
      }
    );
  };

  // Make bottom sheet modal visibility reactive instead of imperative
  useEffect( ( ) => {
    if ( showCommentBox ) {
      bottomSheetModalRef.current?.present( );
    } else {
      bottomSheetModalRef.current?.dismiss( );
    }
  }, [showCommentBox, bottomSheetModalRef] );

  const renderHandle = () => (
    <View style={viewStyles.handleContainer} />
  );

  const renderBackdrop = () => (
    <TouchableOpacity activeOpacity={1} style={viewStyles.background} onPress={onBackdropPress}>
      <View />
    </TouchableOpacity>
  );

  const submitComment = async ( ) => {
    setAddingComment( true );
    clearComment( );
    setShowCommentBox( false );
    Keyboard.dismiss();
    if ( comment.length > 0 ) {
      createCommentMutation.mutate( comment );
    }
    setAddingComment( false );
  };

  const renderBottomSheetTextView = () => (
    <BottomSheetTextInput
      keyboardType="default"
      style={[viewStyles.commentInput, viewStyles.commentInputText, textStyles.commentTextInput]}
      value={comment}
      selectionColor={colors.black}
      activeUnderlineColor={colors.transparent}
      placeholder={t( "Add-a-comment" )}
      autoFocus
      multiline
      onChangeText={setComment}
      render={innerProps => (
        <NativeTextInput
              /* eslint-disable react/jsx-props-no-spreading */
          {...innerProps}
          style={[
            innerProps.style,
            viewStyles.commentInputText, textStyles.commentTextInput
          ]}
        />
      )}
    />
  );

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableOverDrag={false}
        enablePanDownToClose
        snapPoints={[snapPoint]}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        style={viewStyles.bottomModal}
      >
        <View
          style={viewStyles.commentInputContainer}
          onLayout={( {
            nativeEvent: {
              layout: { height }
            }
          } ) => {
            setSnapPoint( height + 20 );
          }}
        >
          {renderBottomSheetTextView()}
          <TouchableOpacity
            style={viewStyles.sendComment}
            onPress={() => submitComment( )}
          >
            <IconMaterial name="send" size={35} color={colors.inatGreen} />
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default AddCommentModal;
