// @flow

import {
  Modal, SafeAreaView,
  ScrollView,
  Text
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Keyboard
// } from "react-native";
import { Checkbox, TextInput } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
// import colors from "styles/tailwindColors";

type Props = {
  showFlagItemModal: boolean,
  closeFlagItemModal: Function
}

const FlagItemModal = ( {
  showFlagItemModal, closeFlagItemModal
}: Props ): Node => {
// Clear the comment in a timeout so it doesn't trigger a re-render of the
// text input *after* the bottom sheet modal gets dismissed, b/c that seems
// to re-render the bottom sheet in a presented state, making it hard to
// actually dismiss
// const clearForm = ( ) => setTimeout( ( ) => setComment( "" ), 100 );

  // const renderBackdrop = props => (
  //   <BottomSheetStandardBackdrop props={props} />
  // );

  // const clearAndCloseForm = useCallback( ( ) => {
  //   clearComment( );
  //   setShowCommentBox( false );
  //   Keyboard.dismiss();
  // }, [setShowCommentBox] );

  // const submitForm = async ( ) => {
  // };

  const [spamChecked, setSpamChecked] = useState( false );
  const [offensiveChecked, setOffensiveChecked] = useState( false );
  const [otherChecked, setOtherChecked] = useState( false );

  return (
    <Modal visible={showFlagItemModal}>
      <SafeAreaView>
        <IconMaterial name="close" onPress={closeFlagItemModal} />
        <Text>
          {t( "Flag-An-Item" )}
        </Text>
        <ScrollView>
          <Text>
            {t( "Flag-Item-Description" )}
          </Text>
          <Checkbox.Item
            label={t( "Spam" )}
            status={spamChecked ? "checked" : "unchecked"}
            onPress={() => {
              setSpamChecked( !spamChecked );
            }}
          />
          <Checkbox.Item
            label={t( "Offensive-Inappropriate" )}
            status={offensiveChecked ? "checked" : "unchecked"}
            onPress={() => {
              setOffensiveChecked( !offensiveChecked );
            }}
          />
          <Checkbox.Item
            label={t( "Other" )}
            status={otherChecked ? "checked" : "unchecked"}
            onPress={() => {
              setOtherChecked( !otherChecked );
            }}
          />
          <TextInput />

        </ScrollView>
      </SafeAreaView>
    </Modal>

  );
};
export default FlagItemModal;
