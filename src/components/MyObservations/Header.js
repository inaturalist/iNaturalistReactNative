// @flow
import { useNavigation } from "@react-navigation/native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import {
  Button, Heading1, Subheading1
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { IconButton, useTheme } from "react-native-paper";
// import { Animated } from "react-native";
import User from "realmModels/User";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

import Onboarding from "./Onboarding";

type Props = {
  setLayout: Function;
  layout: string,
  // hideHeaderCard: boolean,
  currentUser: ?Object,
  numObservations: number,
  setHeightAboveToolbar: Function
}

// const fade = ( value, duration ) => ( {
//   toValue: value,
//   duration,
//   useNativeDriver: true
// } );

const Header = ( {
  setLayout,
  layout,
  // hideHeaderCard,
  currentUser,
  numObservations,
  setHeightAboveToolbar
}: Props ): Node => {
  const theme = useTheme( );
  // const fadeAnimation = useRef( new Animated.Value( 1 ) ).current;
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );
  const hideToolbar = numObservations === 0;

  // 03032023 amanda - I was trying to fade out the header on iOS as a way
  // of making sure the header doesn't go behind the status bar
  // but it's pretty rudimentary. we should either use a fade more connected
  // to scrolling, or ideally, find a way to make sure text doesn't go under the
  // status bar without needing animation at all

  // useEffect( ( ) => {
  //   if ( hideHeaderCard ) {
  //     Animated.timing( fadeAnimation, fade( 0, 1000 ) ).start( );
  //   } else {
  //     Animated.timing( fadeAnimation, fade( 1, 500 ) ).start( );
  //   }
  // }, [hideHeaderCard, fadeAnimation] );

  const displayHeaderCard = ( ) => {
    if ( currentUser ) {
      return (
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
    }

    return (
      <>
        <View className="flex-row items-center">
          <IconButton
            className="mr-5"
            icon="logomark"
            size={40}
            iconColor={theme.colors.onSecondary}
            backgroundColor={theme.colors.secondary}
          />
          {numUnuploadedObs > 0 ? (
            <View>
              <Subheading1
                className="mt-5"
                testID="log-in-to-iNaturalist-text"
              >
                {t( "Log-in-to-contribute-and-sync" )}
              </Subheading1>
              <Heading1 className="mb-5">
                {t( "X-observations", { count: numUnuploadedObs } )}
              </Heading1>

            </View>
          ) : (
            <Subheading1
              className="my-5"
            >
              {t( "Log-in-to-contribute-your-observations" )}
            </Subheading1>
          )}
        </View>
        <Button
          onPress={( ) => navigation.navigate( "login" )}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-login-screen" )}
          text={t( "LOG-IN-TO-INATURALIST" )}
          level="focus"
        />
      </>
    );
  };

  return (
    <>
      <View
        className="px-5 bg-white w-screen"
        onLayout={event => {
          const {
            height
          } = event.nativeEvent.layout;
          setHeightAboveToolbar( height );
        }}
      >
        {/* <Animated.View
          style={{
            opacity: fadeAnimation
          }}
        > */}
        {displayHeaderCard( )}
        <Onboarding />
        {/* </Animated.View> */}
      </View>
      {!hideToolbar && (
        <ToolbarContainer
          setLayout={setLayout}
          layout={layout}
          numUnuploadedObs={numUnuploadedObs}
        />
      )}
    </>
  );
};

export default Header;
