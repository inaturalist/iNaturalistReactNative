// @flow

import {
  BottomSheetModal
} from "@gorhom/bottom-sheet";
import {
  Body3, BottomSheetStandardBackdrop, Button, Heading4, INatIconButton
} from "components/SharedComponents";
import { BottomSheetTextInput, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect, useRef, useState
} from "react";
import {
  Keyboard
} from "react-native";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import { viewStyles } from "styles/obsDetails/obsDetails";
import colors from "styles/tailwindColors";

type Props = {
  title?: string,
  onCommentAdded: Function,
  showCommentBox: boolean,
  setShowCommentBox: Function,
  setAddingComment?: Function,
  commentToEdit?: string,
  edit?: boolean
}

const AddCommentModal = ( {
  title,
  onCommentAdded,
  showCommentBox,
  setShowCommentBox,
  setAddingComment,
  commentToEdit,
  edit
}: Props ): Node => {
  const { t } = useTranslation( );
  const [comment, setComment] = useState( "" );
  const bottomSheetModalRef = useRef( null );
  const [snapPoint, setSnapPoint] = useState( 100 );
  const theme = useTheme();

  // Clear the comment in a timeout so it doesn't trigger a re-render of the
  // text input *after* the bottom sheet modal gets dismissed, b/c that seems
  // to re-render the bottom sheet in a presented state, making it hard to
  // actually dismiss
  const clearComment = ( ) => setTimeout( ( ) => setComment( "" ), 100 );

  // Make bottom sheet modal visibility reactive instead of imperative
  useEffect( ( ) => {
    if ( showCommentBox ) {
      bottomSheetModalRef.current?.present( );
      if ( edit && commentToEdit ) {
        setComment( commentToEdit );
      }
    } else {
      bottomSheetModalRef.current?.dismiss( );
    }
  }, [showCommentBox, bottomSheetModalRef, commentToEdit, edit] );

  const renderHandle = () => <View />;

  const renderBackdrop = props => (
    <BottomSheetStandardBackdrop props={props} />
  );

  const clearAndCloseCommentBox = useCallback( ( ) => {
    clearComment( );
    setShowCommentBox( false );
    Keyboard.dismiss();
  }, [setShowCommentBox] );

  const submitComment = async ( ) => {
    if ( setAddingComment ) {
      setAddingComment( true );
    }
    if ( comment.length > 0 || edit ) {
      onCommentAdded( comment );
    }
    clearAndCloseCommentBox( );
  };

  const handleSheetChanges = useCallback( index => {
    // re-enable Add Comment button when backdrop is tapped to close modal
    if ( index === -1 ) {
      clearAndCloseCommentBox( );
    }
  }, [clearAndCloseCommentBox] );

  const renderTextInput = () => (
    <BottomSheetTextInput
      testID="AddCommentModal.commentInput"
      keyboardType="default"
      className="mb-16 h-16 mt-4"
      defaultValue={comment}
      selectionColor={theme.colors.tertiary}
      activeUnderlineColor={theme.colors.background}
      placeholder={t( "Add-a-comment" )}
      autoFocus
      multiline
      onChangeText={setComment}
    />
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      enableOverDrag={false}
      enablePanDownToClose
      snapPoints={[snapPoint]}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      // TODO: figure out how to style shadows/elevation using Tailwind
      style={viewStyles.bottomModal}
      onChange={handleSheetChanges}
    >
      <View
        className="flex-col p-[20px] items-center"
        onLayout={( {
          nativeEvent: {
            layout: { height }
          }
        } ) => {
          setSnapPoint( height + 20 );
        }}
      >
        <INatIconButton
          onPress={clearAndCloseCommentBox}
          className="absolute top-1 right-1"
          icon="close"
          color={colors.darkGray}
        />
        {title
          ? (
            <Heading4>{title}</Heading4>
          )
          : (
            <Heading4>{t( "ADD-COMMENT" )}</Heading4>
          )}

        <View className="border border-lightGray p-[5px] m-[10px] my-[15px]  w-full">
          {renderTextInput()}
          <Pressable
            className="absolute bottom-2 right-2"
            accessibilityRole="button"
            onPress={() => setComment( "" )}
          >
            <Body3 className="opacity-50">{t( "Clear" )}</Body3>
          </Pressable>
        </View>
        <Button
          testID="AddCommentModal.sendButton"
          accessibilityRole="button"
          level="primary"
          className="w-full"
          onPress={() => submitComment()}
          text={t( "CONFIRM" )}
        />
      </View>
    </BottomSheetModal>
  );
};

export default AddCommentModal;
