// @flow

import { useNavigation } from "@react-navigation/native";
import { Button, Heading4, List2 } from "components/SharedComponents";
import BottomSheet from "components/SharedComponents/BottomSheet";
import BottomSheetStandardBackdrop from "components/SharedComponents/BottomSheetStandardBackdrop";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";

const LoginSheet = ( ): Node => {
  const obsEditContext = useContext( ObsEditContext );
  const showLoginSheet = obsEditContext?.showLoginSheet;
  const setShowLoginSheet = obsEditContext?.setShowLoginSheet;
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const handleClose = ( ) => setShowLoginSheet( false );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  if ( !currentUser && showLoginSheet ) {
    return (
      <BottomSheet
        hide={!showLoginSheet}
        snapPoints={["25%"]}
        backdropComponent={renderBackdrop}
        handleClose={handleClose}
      >
        <View className="m-5">
          <Heading4 className="text-center py-1">
            {t( "PLEASE-LOG-IN" )}
          </Heading4>
          <View className="absolute right-0 top-0">
            <IconMaterial
              name="close"
              onPress={handleClose}
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
              handleClose( );
              navigation.navigate( "login" );
            }}
          />
        </View>
      </BottomSheet>
    );
  }

  return null;
};

export default LoginSheet;
