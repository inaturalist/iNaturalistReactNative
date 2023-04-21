// @flow

import { useNavigation } from "@react-navigation/native";
import {
  BottomSheet, BottomSheetStandardBackdrop,
  Button, Heading4, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { IconButton } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowDiscardSheet: Function
}

const DiscardChangesSheet = ( {
  setShowDiscardSheet
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      snapPoints={[180]}
      backdropComponent={renderBackdrop}
      onChange={position => {
        if ( position === -1 ) {
          setShowDiscardSheet( false );
        }
      }}
    >
      <View className="px-[20px]">
        <View className="relative flex items-center justify-center mt-[22px]">
          <Heading4>{t( "DISCARD-PHOTOS" )}</Heading4>
          <View className="absolute right-0">
            <IconButton
              icon="close"
              onPress={( ) => setShowDiscardSheet( false )}
              accessibilityLabel={t( "Cancel" )}
              accessibilityState={{ disabled: false }}
            />
          </View>
        </View>
        <List2 className="my-[20px] text-center">
          {t( "By-exiting-your-photos-will-not-be-saved" )}
        </List2>
        <View className="flex flex-row">
          <Button
            level="neutral"
            text={t( "CANCEL" )}
            onPress={( ) => setShowDiscardSheet( false )}
            accessibilityLabel={t( "CANCEL" )}
            accessibilityState={{ disabled: false }}
          />
          <Button
            className="flex-1 ml-[12px]"
            level="warning"
            text={t( "DISCARD" )}
            accessibilityLabel={t( "DISCARD" )}
            onPress={( ) => {
              setShowDiscardSheet( false );
              navigation.goBack( );
            }}
            accessibilityState={{ disabled: false }}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default DiscardChangesSheet;
