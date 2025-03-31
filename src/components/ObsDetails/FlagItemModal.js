// @flow
import createFlag from "api/flags";
import {
  BackButton,
  Body1, Body3, Button, Checkbox, Subheading1
} from "components/SharedComponents";
import {
  Modal,
  SafeAreaView,
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import {
  Alert,
  findNodeHandle
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

type Props = {
  id:number,
  itemType:string,
  showFlagItemModal: boolean,
  closeFlagItemModal: Function,
  onItemFlagged: Function
}

const FlagItemModal = ( {
  id, itemType, showFlagItemModal, closeFlagItemModal, onItemFlagged
}: Props ): Node => {
  const keyboardScrollRef = useRef( null );
  const [checkBoxValue, setCheckBoxValue] = useState( "none" );
  const [explanation, setExplanation] = useState( "" );
  const [loading, setLoading] = useState( false );

  const showErrorAlert = error => Alert.alert(
    "Error",
    error,
    [{ text: t( "OK" ) }],
    {
      cancelable: true
    }
  );

  const scrollToInput = node => {
    keyboardScrollRef?.current?.scrollToFocusedInput( node );
  };

  const toggleCheckBoxValue = checkbox => {
    if ( checkBoxValue === checkbox ) {
      setCheckBoxValue( "none" );
    } else { setCheckBoxValue( checkbox ); }
  };

  const resetFlagModal = () => {
    setCheckBoxValue( "none" );
    setExplanation( "" );
    closeFlagItemModal();
    setLoading( false );
  };

  const createFlagMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createFlag( params, optsWithAuth ),
    {
      onSuccess: data => {
        resetFlagModal();
        onItemFlagged( data );
      },
      onError: error => {
        setLoading( false );
        showErrorAlert( error );
      }
    }
  );

  const submitFlag = () => {
    if ( checkBoxValue !== "none" ) {
      let params = {
        flag: {
          flaggable_type: itemType,
          flaggable_id: id,
          flag: checkBoxValue

        }
      };
      if ( checkBoxValue === "other" ) {
        params = { ...params, flag_explanation: explanation };
      }
      setLoading( true );
      createFlagMutation.mutate( params );
    }
  };

  return (
    <Modal
      visible={showFlagItemModal}
      animationType="slide"
      className="flex-1"
      testID="FlagItemModal"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row-reverse justify-between p-6 border-b">
          <BackButton onPress={closeFlagItemModal} />
          <Subheading1 className="text-xl">
            {t( "Flag-An-Item" )}
          </Subheading1>
        </View>
        <KeyboardAwareScrollView
          ref={keyboardScrollRef}
          enableOnAndroid
          enableAutomaticScroll
          extraHeight={200}
          className="p-6"
        >
          <Body1 className="text-base">
            {t( "Flag-Item-Description" )}
          </Body1>
          <View className="flex-row my-2">
            <Checkbox
              isChecked={checkBoxValue === "spam"}
              onValueChange={() => toggleCheckBoxValue( "spam" )}
              text={t( "Spam" )}
            />
          </View>
          <Body1 className="mb-2 text-base" style>{t( "Spam-Examples" )}</Body1>

          <View className="flex-row my-2">
            <Checkbox
              isChecked={checkBoxValue === "inappropriate"}
              onValueChange={() => toggleCheckBoxValue( "inappropriate" )}
              text={t( "Offensive-Inappropriate" )}
            />
          </View>
          <Body1 className="mb-2 text-base">{t( "Offensive-Inappropriate-Examples" )}</Body1>

          <View className="flex-row my-2">
            <Checkbox
              isChecked={checkBoxValue === "other"}
              onValueChange={() => toggleCheckBoxValue( "other" )}
              text={t( "Other" )}
            />
          </View>
          <Body1 className="mb-2 text-base">{t( "Flag-Item-Other-Description" )}</Body1>
          {( checkBoxValue === "other" )
           && (
             <>
               <TextInput
                 className="text-sm"
                 placeholder={t( "Flag-Item-Other-Input-Hint" )}
                 value={explanation}
                 onChangeText={text => setExplanation( text )}
                 onFocus={e => scrollToInput( findNodeHandle( e.target ) )}
                 accessibilityLabel={t( "Reason--flag" )}
               />
               <Body3>{`${explanation.length}/255`}</Body3>
             </>
           )}
          <View className="flex-row justify-center m-4">
            <Button
              className="m-2"
              text={t( "Cancel" )}
              onPress={() => resetFlagModal()}
            />
            <Button
              className="m-2"
              text={t( "Save" )}
              onPress={submitFlag}
              level="primary"
              loading={loading}
            />

          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>

  );
};
export default FlagItemModal;
