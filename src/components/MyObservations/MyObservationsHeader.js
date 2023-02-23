// @flow
import { useNavigation } from "@react-navigation/native";
import MyObservationsToolbar from "components/MyObservations/MyObservationsToolbar";
import { Button, Heading1, Subheading1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

type Props = {
  setLayout: Function;
  layout: string
}

const MyObservationsHeader = ( {
  setLayout,
  layout
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );

  return (
    <>
      {currentUser
        ? (
          <View className="px-5 bg-white">
            <Trans
              i18nKey="Welcome-user"
              parent={View}
              values={{ userHandle: User.userHandle( currentUser ) }}
              components={[
                <Subheading1 className="mt-5" />,
                <Heading1 />
              ]}
            />
          </View>
        ) : (
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
        )}
      <MyObservationsToolbar
        setLayout={setLayout}
        layout={layout}
        numUnuploadedObs={numUnuploadedObs}
      />
    </>
  );
};

export default MyObservationsHeader;
