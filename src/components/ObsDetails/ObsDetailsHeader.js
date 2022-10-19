// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button, Headline } from "react-native-paper";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/colors";
import { viewStyles } from "styles/obsDetails/obsDetailsHeader";

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
    <View style={viewStyles.headerRow}>
      <HeaderBackButton onPress={( ) => navigation.goBack( )} />
      <Headline>{t( "Observation" )}</Headline>
      {
        ( obsCreatedLocally || obsOwnedByCurrentUser )
          ? <Button icon="pencil" onPress={navToObsEdit} textColor={colors.gray} />
          : <View />
      }
    </View>
  );
};

export default ObsDetailsHeader;
