// @flow

import {
  BottomSheetModal, BottomSheetModalProvider
} from "@gorhom/bottom-sheet";
import BottomSheetStandardBackdrop from "components/SharedComponents/BottomSheetStandardBackdrop";
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
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useTranslation from "sharedHooks/useTranslation";
import { viewStyles } from "styles/obsDetails/obsDetails";

type Props = {
  onCommentAdded: Function,
  showCommentBox: boolean,
  setShowCommentBox: Function,
  setAddingComment: Function
}

const AddCommentModal = ( {
  onCommentAdded,
  showCommentBox,
  setShowCommentBox,
  setAddingComment
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
    } else {
      bottomSheetModalRef.current?.dismiss( );
    }
  }, [showCommentBox, bottomSheetModalRef] );

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
    setAddingComment( true );
    if ( comment.length > 0 ) {
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
    <BottomSheetModalProvider>
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
          className="p-3"
          onLayout={( {
            nativeEvent: {
              layout: { height }
            }
          } ) => {
            setSnapPoint( height + 20 );
          }}
        >
          {renderTextInput()}
          <Pressable
            accessibilityRole="button"
            className="absolute right-4 bottom-4"
            onPress={( ) => submitComment( )}
          >
            <IconMaterial name="send" size={35} color={theme.colors.secondary} />
          </Pressable>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default AddCommentModal;
