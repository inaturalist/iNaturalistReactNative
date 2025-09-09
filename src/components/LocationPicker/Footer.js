// @flow

import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleSave: Function
};

const Footer = ( { handleSave }: Props ): Node => {
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
