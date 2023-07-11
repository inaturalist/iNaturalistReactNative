// @flow
import { useNavigation } from "@react-navigation/native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import {
  Button, Heading1, Subheading1
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { IconButton, useTheme } from "react-native-paper";
import User from "realmModels/User";
import { useNumUnuploadedObservations, useTranslation } from "sharedHooks";

import Onboarding from "./Onboarding";

type Props = {
  toggleLayout: Function;
  layout: string,
  currentUser: ?Object,
  numObservations: number,
  setHeightAboveToolbar: Function,
  allObsToUpload: Array<Object>,
  setShowLoginSheet: Function
}

const Header = ( {
  toggleLayout,
  layout,
  currentUser,
  numObservations,
  setHeightAboveToolbar,
  allObsToUpload,
  setShowLoginSheet
}: Props ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );
  const hideToolbar = numObservations === 0;

  const signedInContent = ( ) => (
    <Trans
      i18nKey="Welcome-user"
      parent={View}
      values={{ userHandle: User.userHandle( currentUser ) }}
      components={[
        <Subheading1 className="mt-5" />,
        <Heading1 />
      ]}
    />
  );

  const signedOutContent = ( ) => (
    <>
      <View className="flex-row items-center">
        <IconButton
          className="mr-5"
          icon="inaturalist"
          size={40}
          iconColor={theme.colors.onSecondary}
          backgroundColor={theme.colors.secondary}
          disabled={false}
          accessibilityState={{ disabled: false }}
        />
        {numUnuploadedObs > 0
          ? (
            <View className="shrink">
              <Subheading1
                className="mt-5"
                testID="log-in-to-iNaturalist-text"
              >
                {t( "Log-in-to-contribute-and-sync" )}
              </Subheading1>
              <Heading1 className="mb-5">
                { t( "X-observations", { count: numUnuploadedObs } ) }
              </Heading1>
            </View>
          )
          : (
            <Subheading1
              className="my-5 shrink"
              testID="log-in-to-iNaturalist-text-no-observations"
            >
              {t( "Log-in-to-contribute-your-observations" )}
            </Subheading1>
          )}
      </View>
      <Button
        onPress={( ) => navigation.navigate( "Login" )}
        accessibilityRole="link"
        accessibilityLabel={t( "Navigate-to-login-screen" )}
        text={t( "LOG-IN-TO-INATURALIST" )}
        level="focus"
        testID="log-in-to-iNaturalist-button"
      />
    </>
  );

  return (
    <>
      <View
        className="px-5 bg-white w-full"
        onLayout={event => {
          const {
            height
          } = event.nativeEvent.layout;
          setHeightAboveToolbar( height );
        }}
      >
        {currentUser
          ? signedInContent( )
          : signedOutContent( )}
        <Onboarding />
      </View>
      {!hideToolbar && (
        <ToolbarContainer
          toggleLayout={toggleLayout}
          layout={layout}
          numUnuploadedObs={numUnuploadedObs}
          allObsToUpload={allObsToUpload}
          setShowLoginSheet={setShowLoginSheet}
        />
      )}
    </>
  );
};

export default Header;
