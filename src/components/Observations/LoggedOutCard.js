// @flow

import { useNavigation } from "@react-navigation/native";
import { Pressable, Text } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

const LoggedOutCard = ( ): Node => {
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );

  return (
    <Pressable
      onPress={( ) => navigation.navigate( "login" )}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-login-screen" )}
      className="rounded-bl-3xl rounded-br-3xl h-24 justify-center"
    >
      <Text
        testID="log-in-to-iNaturalist-text"
        className="self-center text-2xl"
      >
        {t( "Log-in-to-iNaturalist" )}
      </Text>
      <Text className="self-center text-base">
        {t( "X-unuploaded-observations", { observationCount: numUnuploadedObs } )}
      </Text>
    </Pressable>
  );
};

export default LoggedOutCard;
