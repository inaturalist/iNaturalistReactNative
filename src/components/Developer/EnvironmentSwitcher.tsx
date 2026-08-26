/* eslint-disable arrow-body-style */
/* eslint-disable i18next/no-literal-string */
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import {
  Button,
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React, { useMemo } from "react";
import {
  Alert,
} from "react-native";
import { getAvailableEnvironments } from "sharedHelpers/envConfig";
import { getEnvironmentOverride, setEnvironmentOverride } from "sharedHelpers/installData";

import {
  CODE, H1, P,
} from "./DeveloperSharedComponents";

const { useRealm } = RealmContext;

const defaultEnvironmentLabel = __DEV__
  ? "the default environment"
  : "Production";

const EnvironmentSwitcher = () => {
  const queryClient = useQueryClient();
  const realm = useRealm();

  const activeEnvironment = useMemo( () => getEnvironmentOverride(), [] );
  const availableEnvironments = getAvailableEnvironments();

  const confirmSwitch = ( prefix: string | null ) => {
    Alert.alert(
      "Switch environment?",
      "This will sign you out, delete all observations, and restart "
        + `the app on ${prefix ?? defaultEnvironmentLabel}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          style: "destructive",
          onPress: () => {
            setEnvironmentOverride( prefix );
            signOut( { realm, clearRealm: true, queryClient } );
          },
        },
      ],
    );
  };

  return (
    <>
      <H1>Environment</H1>
      <P>
        <CODE>{`Active: ${activeEnvironment ?? "default"}`}</CODE>
      </P>
      <Button
        onPress={() => confirmSwitch( null )}
        text={`USE ${__DEV__
          ? "DEFAULT"
          : "PRODUCTION"}`}
        className="mb-5"
        disabled={!activeEnvironment}
      />
      {availableEnvironments.map( env => (
        <Button
          key={env}
          onPress={() => confirmSwitch( env )}
          text={`SWITCH TO ${env}`}
          className="mb-5"
          disabled={activeEnvironment === env}
        />
      ) )}
    </>
  );
};

export default EnvironmentSwitcher;
