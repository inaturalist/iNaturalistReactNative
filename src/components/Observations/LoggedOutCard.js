// @flow

import { useNavigation } from "@react-navigation/native";
import { Pressable, Text } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import useLocalObservations from "sharedHooks/useLocalObservations";

const LoggedOutCard = ( ): Node => {
  const navigation = useNavigation( );
  const localObservations = useLocalObservations( );
  const { unuploadedObsList } = localObservations;
  const numOfUnuploadedObs = unuploadedObsList?.length;

  return (
    <Pressable
      onPress={( ) => navigation.navigate( "login" )}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-login-screen" )}
      className="rounded-bl-3xl rounded-br-3xl bg-primary h-24 justify-center"
    >
      <Text
        testID="log-in-to-iNaturalist-text"
        className="self-center color-white text-2xl"
      >
        {t( "Log-in-to-iNaturalist" )}
      </Text>
      <Text className="self-center color-white text-base">
        {t( "X-unuploaded-observations", { observationCount: numOfUnuploadedObs } )}
      </Text>
    </Pressable>
  );
};

export default LoggedOutCard;
