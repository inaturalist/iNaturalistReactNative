import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  headerText: string;
  texts: string[];
  setShowSheet: ( show: boolean ) => void;
}

const TextSheet = ( {
  headerText,
  texts,
  setShowSheet
}: Props ) => {
  const { t } = useTranslation( );

  const onPressClose = useCallback(
    ( ) => setShowSheet( false ),
    [setShowSheet]
  );

  return (
    <BottomSheet
      onPressClose={onPressClose}
      headerText={headerText}
    >
      <View className="p-5">
        {texts.map( text => (
          <Body3 className="pb-5" key={text}>
            {text}
          </Body3>
        ) )}
        <Button
          text={t( "OK" )}
          onPress={onPressClose}
        />
      </View>
    </BottomSheet>
  );
};

export default TextSheet;
