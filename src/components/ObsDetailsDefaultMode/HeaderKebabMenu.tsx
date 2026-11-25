import { createSubscription } from "api/observations";
import type { ApiSubscription } from "api/types";
import KebabMenu from "components/SharedComponents/KebabMenu";
import { t } from "i18next";
import React, { useState } from "react";
import { Alert, Platform, Share } from "react-native";
import {
  useAuthenticatedMutation,
  useCurrentUser,
} from "sharedHooks";

const observationsUrl = "https://www.inaturalist.org/observations";

interface Props {
  observationId: number;
  uuid: string;
  refetchSubscriptions: ( ) => void;
  subscriptions?: ApiSubscription[];
}

const HeaderKebabMenu = ( {
  observationId,
  uuid,
  refetchSubscriptions,
  subscriptions,
}: Props ) => {
  const currentUser = useCurrentUser( );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );

  const url = `${observationsUrl}/${observationId?.toString( )}`;
  const sharingOptions = {
    url: "",
    message: "",
  };

  if ( Platform.OS === "ios" ) {
    sharingOptions.url = url;
  } else {
    sharingOptions.message = url;
  }

  const isSubscribed = !!subscriptions?.length;

  const handleShare = async ( ) => {
    setKebabMenuVisible( false );
    try {
      return await Share.share( sharingOptions );
    } catch ( error ) {
      Alert.alert( ( error as Error ).message );
      return null;
    }
  };

  const { mutate: toggleSubscriptionMutate } = useAuthenticatedMutation(
    ( params: { uuid: string }, optsWithAuth ) => createSubscription( params, optsWithAuth ),
    {
      onSuccess: () => {
        refetchSubscriptions();
      },
      onError: error => {
        Alert.alert( error.message );
      },
    },
  );

  const toggleSubscriptionOnPress = async ( ) => {
    setKebabMenuVisible( false );
    try {
      return await toggleSubscriptionMutate( { uuid } );
    } catch ( error ) {
      Alert.alert( ( error as Error ).message );
      return null;
    }
  };

  return (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
      accessibilityLabel={t( "Observation-options" )}
      accessibilityHint={t( "Show-observation-options" )}
      large
    >
      <KebabMenu.Item
        isFirst
        onPress={handleShare}
        title={t( "Share" )}
        testID="MenuItem.Share"
      />
      {!!currentUser && ( isSubscribed
        ? (
          <KebabMenu.Item
            isFirst
            onPress={toggleSubscriptionOnPress}
            title={t( "Ignore-notifications" )}
            testID="MenuItem.IgnoreNotifications"
          />
        )
        : (
          <KebabMenu.Item
            isFirst
            onPress={toggleSubscriptionOnPress}
            title={t( "Enable-notifications" )}
            testID="MenuItem.EnableNotifications"
          />
        ) )}
    </KebabMenu>
  );
};

export default HeaderKebabMenu;
