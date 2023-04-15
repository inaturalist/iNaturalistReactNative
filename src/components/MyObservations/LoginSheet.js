// @flow

import { useNavigation } from "@react-navigation/native";
import {
  BottomSheet, BottomSheetStandardBackdrop, Button, Heading4, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowLoginSheet: Function,
}

const LoginSheet = ( { setShowLoginSheet }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      snapPoints={["25%"]}
      backdropComponent={renderBackdrop}
      onChange={position => {
        if ( position === -1 ) {
          setShowLoginSheet( false );
        }
      }}
    >
      <View className="m-5">
        <Heading4 className="text-center py-1">
          {t( "PLEASE-LOG-IN" )}
        </Heading4>
        <View className="absolute right-0 top-0">
          <IconMaterial
            name="close"
            onPress={( ) => setShowLoginSheet( false )}
            size={30}
          />
        </View>
        <List2 className="mt-3">
          {t( "To-sync-your-observations-to-iNaturalist" )}
        </List2>
        <Button
          level="focus"
          text={t( "LOG-IN-TO-INATURALIST" )}
          className="mt-5"
          onPress={( ) => {
            setShowLoginSheet( false );
            navigation.navigate( "Login" );
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default LoginSheet;
