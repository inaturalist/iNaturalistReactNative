// @flow
import { useNavigation } from "@react-navigation/native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import { Button, Heading1, Subheading1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Animated } from "react-native";
import User from "realmModels/User";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

import Onboarding from "./Onboarding";

type Props = {
  setLayout: Function;
  layout: string,
  hideHeaderCard: boolean,
  currentUser: ?Object,
  numObservations: number,
  setHeightAboveToolbar: Function
}

const fade = ( value, duration ) => ( {
  toValue: value,
  duration,
  useNativeDriver: true
} );

const Header = ( {
  setLayout,
  layout,
  hideHeaderCard,
  currentUser,
  numObservations,
  setHeightAboveToolbar
}: Props ): Node => {
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );
  const hideToolbar = numObservations === 0;

  useEffect( ( ) => {
    if ( hideHeaderCard ) {
      Animated.timing( fadeAnimation, fade( 0, 1000 ) ).start( );
    } else {
      Animated.timing( fadeAnimation, fade( 1, 500 ) ).start( );
    }
  }, [hideHeaderCard, fadeAnimation] );

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
        <Animated.View
          style={{
            opacity: fadeAnimation
          }}
        >
          {displayHeaderCard( )}
          <Onboarding numObservations={numObservations} />
        </Animated.View>
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
