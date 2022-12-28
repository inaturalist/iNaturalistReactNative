// @flow

import CheckBox from "@react-native-community/checkbox";
import Button from "components/SharedComponents/Buttons/Button";
import {
  Modal, SafeAreaView,
  ScrollView,
  Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
// import colors from "styles/tailwindColors";
// import { useTranslation } from "react-i18next";
// import {
//   Keyboard
// } from "react-native";
import { TextInput } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  showFlagItemModal: boolean,
  closeFlagItemModal: Function
}

const FlagItemModal = ( {
  showFlagItemModal, closeFlagItemModal
}: Props ): Node => {
  const [value, setValue] = useState( "none" );

  // radio button
  const toggleValue = ( toggle, checkbox ) => {
    if ( toggle ) { setValue( checkbox ); } else { setValue( "none" ); }
  };
  return (
    <Modal
      visible={showFlagItemModal}
      animationType="slide"
    >
      <SafeAreaView>
        <View className="flex-row-reverse justify-between p-6 border-b">
          <IconMaterial name="close" onPress={closeFlagItemModal} size={30} />
          <Text className="text-xl">
            {t( "Flag-An-Item" )}
          </Text>
        </View>
        <ScrollView className="p-6">
          <Text className="text-base">
            {t( "Flag-Item-Description" )}
          </Text>
          <View className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={value === "spam"}
              onValueChange={newValue => toggleValue( newValue, "spam" )}
            />
            <Text className="font-bold text-lg ml-5">{t( "Spam" )}</Text>
          </View>
          <Text className="mb-2 text-base" style>{t( "Spam-Examples" )}</Text>

          <View className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={value === "offensive"}
              onValueChange={newValue => toggleValue( newValue, "offensive" )}
            />
            <Text className="font-bold text-lg ml-5">{t( "Offensive-Inappropriate" )}</Text>
          </View>
          <Text className="mb-2 text-base">{t( "Offensive-Inappropriate-Examples" )}</Text>

          <View className="flex-row my-2">
            <CheckBox
              disabled={false}
              value={value === "other"}
              onValueChange={newValue => toggleValue( newValue, "other" )}
            />
            <Text className="font-bold text-lg ml-5">{t( "Other" )}</Text>
          </View>
          <Text className="mb-2 text-base">{t( "Flag-Item-Other-Description" )}</Text>
          {( value === "other" )
            ? <TextInput className="text-sm" placeholder={t( "Flag-Item-Other-Input-Hint" )} />
            : undefined}
        </ScrollView>
        <View className="flex-row justify-center border-t">
          <Button
            className="rounded m-2"
            text={t( "Cancel" )}
            onPress={closeFlagItemModal}
          />
          <Button
            className="rounded m-2"
            text={t( "Save" )}
            onPress={closeFlagItemModal}
          />
        </View>
      </SafeAreaView>
    </Modal>

  );
};
export default FlagItemModal;
