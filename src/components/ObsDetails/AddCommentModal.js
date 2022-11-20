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
import { useTranslation } from "react-i18next";
import {
  Keyboard
} from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { viewStyles } from "styles/obsDetails/obsDetails";
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

  const handleSheetChanges = useCallback( index => {
    // re-enable Add Comment button when backdrop is tapped to close modal
    if ( index === -1 ) {
      setShowCommentBox( false );
    }
  }, [setShowCommentBox] );

  const renderTextInput = () => (
    <BottomSheetTextInput
      keyboardType="default"
      className="mb-16 h-16 mt-4"
      defaultValue={comment}
      selectionColor={colors.black}
      activeUnderlineColor={colors.transparent}
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
            className="absolute right-4 bottom-4"
            onPress={() => submitComment( )}
          >
            <IconMaterial name="send" size={35} color={colors.inatGreen} />
          </Pressable>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default AddCommentModal;
