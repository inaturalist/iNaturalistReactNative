// @flow
import { useNavigation } from "@react-navigation/native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import {
  Button,
  Heading1,
  INatIconButton,
  Subheading1
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Onboarding from "./Onboarding";

type Props = {
  currentUser: ?Object,
  handleSyncButtonPress: Function,
  hideToolbar: boolean,
  layout: string,
  logInButtonNeutral: boolean,
  numUnuploadedObservations: number,
  setHeightAboveToolbar?: Function,
  toggleLayout: Function
}

const MyObservationsHeader = ( {
  currentUser,
  handleSyncButtonPress,
  hideToolbar,
  layout,
  logInButtonNeutral,
  numUnuploadedObservations,
  setHeightAboveToolbar,
  toggleLayout
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const signedInContent = ( ) => (
    <Pressable
      className="flex flex-row items-center"
      accessibilityRole="link"
      accessibilityHint={t( "Navigates-to-user-profile" )}
      onPress={() => {
        navigation.push( "UserProfile", { userId: currentUser?.id } );
      }}
    >
      <Trans
        className="my-5"
        i18nKey="Welcome-user"
        parent={View}
        values={{ userHandle: currentUser?.login }}
        components={[
          <Subheading1 />,
          <Heading1 />
        ]}
      />
    </Pressable>
  );

  const signedOutContent = ( ) => (
    <View className="my-5 flex-col items-center">
      <View className="flex-row items-center justify-center mb-5">
        <INatIconButton
          className="mr-5"
          icon="inaturalist"
          size={41}
          color={colors.white}
          backgroundColor={colors.inatGreen}
          accessibilityLabel="iNaturalist"
          mode="contained"
          width={67}
          height={67}
        />
        {numUnuploadedObservations > 0
          ? (
            <View className="shrink">
              <Subheading1
                maxFontSizeMultiplier={1.5}
                testID="log-in-to-iNaturalist-text"
              >
                {t( "Log-in-to-contribute-and-sync" )}
              </Subheading1>
              <Heading1 maxFontSizeMultiplier={1.5}>
                { t( "X-observations", { count: numUnuploadedObservations } ) }
              </Heading1>
            </View>
          )
          : (
            <Subheading1
              maxFontSizeMultiplier={1.5}
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
        className="w-full"
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
          if ( setHeightAboveToolbar ) {
            setHeightAboveToolbar( height );
          }
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
