// @flow
import CheckBox from "@react-native-community/checkbox";
import createFlag from "api/flags";
import Button from "components/SharedComponents/Buttons/Button";
import {
  Modal,
  SafeAreaView,
  Text, View
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
import IconMaterial from "react-native-vector-icons/MaterialIcons";
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
  };

  const createFlagMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createFlag( params, optsWithAuth ),
    {
      onSuccess: data => {
        closeFlagItemModal();
        onItemFlagged( data );
      },
      onError: error => {
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
      createFlagMutation.mutate( params );
    }
  };

  return (
    <Modal
      visible={showFlagItemModal}
      animationType="slide"
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row-reverse justify-between p-6 border-b">
          <IconMaterial name="close" onPress={closeFlagItemModal} size={30} />
          <Text className="text-xl">
            {t( "Flag-An-Item" )}
          </Text>
        </View>
        <KeyboardAwareScrollView
          ref={keyboardScrollRef}
          enableOnAndroid
          enableAutomaticScroll
          extraHeight={200}
          className="p-6"
        >
          <Text className="text-base">
            {t( "Flag-Item-Description" )}
          </Text>
          <View className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={checkBoxValue === "spam"}
              onValueChange={() => toggleCheckBoxValue( "spam" )}
            />
            <Text
              className="font-bold text-lg ml-5"
              onPress={() => toggleCheckBoxValue( "spam" )}
            >
              {t( "Spam" )}

            </Text>
          </View>
          <Text className="mb-2 text-base" style>{t( "Spam-Examples" )}</Text>

          <View className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={checkBoxValue === "inappropriate"}
              onValueChange={() => toggleCheckBoxValue( "inappropriate" )}
            />
            <Text
              className="font-bold text-lg ml-5"
              onPress={() => toggleCheckBoxValue( "inappropriate" )}
            >
              {t( "Offensive-Inappropriate" )}

            </Text>
          </View>
          <Text className="mb-2 text-base">{t( "Offensive-Inappropriate-Examples" )}</Text>

          <View className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={checkBoxValue === "other"}
              onValueChange={() => toggleCheckBoxValue( "other" )}
            />
            <Text
              className="font-bold text-lg ml-5"
              onPress={() => toggleCheckBoxValue( "other" )}
            >
              {t( "Other" )}

            </Text>
          </View>
          <Text className="mb-2 text-base">{t( "Flag-Item-Other-Description" )}</Text>
          {( checkBoxValue === "other" )
           && (
           <>
             <TextInput
               className="text-sm"
               placeholder={t( "Flag-Item-Other-Input-Hint" )}
               value={explanation}
               onChangeText={text => setExplanation( text )}
               onFocus={e => scrollToInput( findNodeHandle( e.target ) )}
             />
             <Text>{`${explanation.length}/255`}</Text>
           </>
           )}
          <View className="flex-row justify-center m-4">
            <Button
              className="rounded m-2"
              text={t( "Cancel" )}
              onPress={() => resetFlagModal()}
            />
            <Button
              className="rounded m-2"
              text={t( "Save" )}
              onPress={submitFlag}
              level="primary"
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>

  );
};
export default FlagItemModal;
