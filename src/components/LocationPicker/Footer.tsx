import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { GestureResponderEvent } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  handleSave: ( _event?: GestureResponderEvent ) => void;
}

const Footer = ( { handleSave }: Props ) => {
  const { t } = useTranslation( );

  return (
    <View className="h-[73px] justify-center">
      <Button
        className="mx-[25px]"
        onPress={handleSave}
        testID="LocationPicker.saveButton"
        text={t( "SAVE-LOCATION" )}
        level="neutral"
      />
    </View>
  );
};

export default Footer;
