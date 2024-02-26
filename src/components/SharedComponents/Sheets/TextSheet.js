// @flow

import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  headerText: string,
  texts: [string],
  setShowSheet: Function
}

const TextSheet = ( {
  headerText,
  texts,
  setShowSheet
}: Props ): Node => {
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowSheet( false ),
    [setShowSheet]
  );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
      hideCloseButton
    >
      <View className="p-5">
        {texts.map( text => (
          <Body3 className="pb-5" key={text}>
            {text}
          </Body3>
        ) )}
        <Button
          text={t( "OK" )}
          onPress={handleClose}
        />
      </View>
    </BottomSheet>
  );
};

export default TextSheet;
