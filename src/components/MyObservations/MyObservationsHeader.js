// @flow
import { useNavigation } from "@react-navigation/native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import {
  Button,
  Heading1,
  INatIconButton,
  Subheading1
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { useTheme } from "react-native-paper";
import User from "realmModels/User.ts";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import Onboarding from "./Onboarding";

type Props = {
  currentUser: ?Object,
  handleSyncButtonPress: Function,
  hideToolbar: boolean,
  layout: string,
  logInButtonNeutral: boolean,
  setHeightAboveToolbar: Function,
  toggleLayout: Function
}

const MyObservationsHeader = ( {
  currentUser,
  handleSyncButtonPress,
  hideToolbar,
  layout,
  logInButtonNeutral,
  setHeightAboveToolbar,
  toggleLayout
}: Props ): Node => {
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );

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
    <View className="my-5">
      <View className="flex-row items-center mb-5">
        <INatIconButton
          className="mr-5"
          icon="inaturalist"
          size={41}
          color={theme.colors.onSecondary}
          backgroundColor={theme.colors.secondary}
          accessibilityLabel="iNaturalist"
          mode="contained"
          width={67}
          height={67}
        />
        {numUnuploadedObservations > 0
          ? (
            <View className="shrink">
              <Subheading1
                testID="log-in-to-iNaturalist-text"
              >
                {t( "Log-in-to-contribute-and-sync" )}
              </Subheading1>
              <Heading1>
                { t( "X-observations", { count: numUnuploadedObservations } ) }
              </Heading1>
            </View>
          )
          : (
            <Subheading1
              className="shrink m-0"
              testID="log-in-to-iNaturalist-text-no-observations"
            >
              {t( "Log-in-to-contribute-your-observations" )}
            </Subheading1>
          )}
      </View>
      <Button
        onPress={( ) => navigation.navigate( "LoginStackNavigator" )}
        accessibilityRole="link"
        accessibilityLabel={t( "Log-in" )}
        text={t( "LOG-IN-TO-INATURALIST" )}
        level={logInButtonNeutral
          ? "neutral"
          : "focus"}
        testID="log-in-to-iNaturalist-button"
      />
    </View>
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
          handleSyncButtonPress={handleSyncButtonPress}
          layout={layout}
          toggleLayout={toggleLayout}
        />
      )}
    </>
  );
};

export default MyObservationsHeader;
