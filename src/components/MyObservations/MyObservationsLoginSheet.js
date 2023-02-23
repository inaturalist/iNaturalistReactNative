// @flow

import { useNavigation } from "@react-navigation/native";
import { Button, Heading4, List2 } from "components/SharedComponents";
import BottomSheet from "components/SharedComponents/BottomSheet";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";

const MyObservationsLoginSheet = ( ): Node => {
  const [closed, setClosed] = useState( false );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  if ( !currentUser ) {
    return (
      <BottomSheet hide={closed} snapPoints={["25%"]}>
        <Heading4 className="text-center py-1">
          {t( "PLEASE-LOG-IN" )}
        </Heading4>
        <View className="absolute right-5 top-5">
          <IconMaterial
            name="close"
            onPress={( ) => setClosed( true )}
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
          onPress={( ) => navigation.navigate( "login" )}
        />
      </BottomSheet>
    );
  }

  return null;
};

export default MyObservationsLoginSheet;
