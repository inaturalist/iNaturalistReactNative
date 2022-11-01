// @flow

import { useNavigation } from "@react-navigation/native";
import CustomHeader from "components/SharedComponents/CustomHeader";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "react-native-paper";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/tailwindColors";

type Props = {
  observation: ?Object
}

const ObsDetailsHeader = ( { observation }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const obsCreatedLocally = observation?.id === null;
  const obsOwnedByCurrentUser = observation?.user?.id === currentUser?.id;

  const navToObsEdit = ( ) => navigation.navigate( "ObsEdit", { uuid: observation?.uuid } );

  return (
    <CustomHeader
      headerText={t( "Observation" )}
      rightIcon={
        ( obsCreatedLocally || obsOwnedByCurrentUser )
          ? <Button icon="pencil" onPress={navToObsEdit} textColor={colors.gray} />
          : <View />
      }
    />
  );
};

export default ObsDetailsHeader;
