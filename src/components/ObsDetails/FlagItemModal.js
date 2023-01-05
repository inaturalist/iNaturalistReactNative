// @flow

import CheckBox from "@react-native-community/checkbox";
import createFlag from "api/flags";
import Button from "components/SharedComponents/Buttons/Button";
import {
  Modal, Pressable,
  SafeAreaView,
  Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import {
  findNodeHandle
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

type Props = {
  id:number,
  showFlagItemModal: boolean,
  closeFlagItemModal: Function
}

const FlagItemModal = ( {
  id, showFlagItemModal, closeFlagItemModal
}: Props ): Node => {
  const keyboardScrollRef = useRef( null );
  const [value, setValue] = useState( "none" );
  const [explanation, setExplanation] = useState( "" );

  const scrollToInput = node => {
    keyboardScrollRef?.current?.scrollToFocusedInput( node );
  };

  const toggleValue = checkbox => {
    if ( value === checkbox ) { setValue( "none" ); } else { setValue( checkbox ); }
  };

  const clearForm = () => {
    setValue( "none" );
    setExplanation( "" );
    closeFlagItemModal();
  };

  const createFlagMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createFlag( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        // waiting for final designs
      }
    }
  );

  const submitFlag = async () => {
    if ( value !== "none" ) {
      let params = {
        flag: {
          flaggable_type: "Identification",
          flaggable_id: id,
          flag: value

        }
      };
      if ( value === "other" ) {
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
          <Pressable className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={value === "spam"}
              onValueChange={() => toggleValue( "spam" )}
            />
            <Text
              className="font-bold text-lg ml-5"
              onPress={() => toggleValue( "spam" )}
            >
              {t( "Spam" )}

            </Text>
          </Pressable>
          <Text className="mb-2 text-base" style>{t( "Spam-Examples" )}</Text>

          <Pressable className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={value === "inappropriate"}
              onValueChange={() => toggleValue( "inappropriate" )}
            />
            <Text
              className="font-bold text-lg ml-5"
              onPress={() => toggleValue( "inappropriate" )}
            >
              {t( "Offensive-Inappropriate" )}

            </Text>
          </Pressable>
          <Text className="mb-2 text-base">{t( "Offensive-Inappropriate-Examples" )}</Text>

          <Pressable className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={value === "other"}
              onValueChange={() => toggleValue( "other" )}
            />
            <Text
              className="font-bold text-lg ml-5"
              onPress={() => toggleValue( "other" )}
            >
              {t( "Other" )}

            </Text>
          </Pressable>
          <Text className="mb-2 text-base">{t( "Flag-Item-Other-Description" )}</Text>
          {( value === "other" )
            ? (
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
            )
            : undefined}
          <View className="flex-row justify-center m-4">
            <Button
              className="rounded m-2"
              text={t( "Cancel" )}
              onPress={() => clearForm()}
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
