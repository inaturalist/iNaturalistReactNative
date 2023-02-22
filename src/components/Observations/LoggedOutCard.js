// @flow

import { useNavigation } from "@react-navigation/native";
import { Button, Heading1, Subheading1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

const LoggedOutCard = ( ): Node => {
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );

  return (
    <View className="mx-5">
      <Subheading1
        className="mt-5"
        testID="log-in-to-iNaturalist-text"
      >
        {t( "Log-in-to-contribute-and-sync" )}
      </Subheading1>
      <Heading1 className="mb-5">
        {t( "X-observations", { count: numUnuploadedObs } )}
      </Heading1>
      <Button
        onPress={( ) => navigation.navigate( "login" )}
        accessibilityRole="link"
        accessibilityLabel={t( "Navigate-to-login-screen" )}
        text={t( "LOG-IN-TO-INATURALIST" )}
        level="focus"
      />
    </View>
  );
};

export default LoggedOutCard;
