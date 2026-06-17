import {
  ActivityIndicator,
  Body2,
  Button,
  Heading4,
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React, { useEffect, useState } from "react";
import {
  View,
} from "react-native";
import QueueItem from "realmModels/QueueItem";
import {
  useTranslation,
  useUserMe,
} from "sharedHooks";
import useNavigateToAccountSettings from "sharedHooks/useNavigateToAccountSettings";

import LanguageSetting from "./LanguageSetting";
import TaxonNamesSetting from "./TaxonNamesSetting";

const { useRealm } = RealmContext;

const LoggedInDefaultSettings = ( ) => {
  const realm = useRealm( );
  const { t } = useTranslation( );
  const {
    remoteUser, isLoading, refetchUserMe,
  } = useUserMe( { updateRealm: false } );
  const [settings, setSettings] = useState( {} );
  const [isSaving, setIsSaving] = useState( false );

  const navigateToAccountSettings = useNavigateToAccountSettings( { onFinish: refetchUserMe } );

  useEffect( () => {
    if ( remoteUser ) {
      // logger.info( remoteUser, "remote user fetched in Settings" );
      setSettings( remoteUser );
      setIsSaving( false );
    }
  }, [remoteUser, realm] );

  return (
    <View className="mt-[30px]">
      {( isSaving || isLoading ) && (
        <View className="absolute z-10 bg-white/80
       w-full h-full flex items-center justify-center"
        >
          <ActivityIndicator size={50} />
        </View>
      )}
      <TaxonNamesSetting
        onChange={options => {
        // logger.info( "Enqueuing taxon name change with options:", options );
        // logger.info( `Current user ID being updated: ${settings.id}` );

          const payload = JSON.stringify( {
            id: settings.id,
            user: {
              prefers_common_names: options.prefers_common_names,
              prefers_scientific_name_first: options.prefers_scientific_name_first,
            },
          } );

          // log.info( `Payload to be enqueued: ${payload}` );
          QueueItem.enqueue(
            realm,
            payload,
            "taxon-names-change",
          );
        }}
      />
      <LanguageSetting
        onChange={newLocale => {
          QueueItem.enqueue(
            realm,
            JSON.stringify( {
              id: settings.id,
              user: {
                locale: newLocale,
              },
            } ),
            "locale-change",
          );
        }}
      />
      <View>
        <Heading4>{t( "INATURALIST-ACCOUNT-SETTINGS" )}</Heading4>
        <Body2 className="mt-2">{t( "Edit-your-profile-change-your-settings" )}</Body2>
        <Button
          className="mt-4"
          text={t( "ACCOUNT-SETTINGS" )}
          onPress={navigateToAccountSettings}
          accessibilityLabel={t( "INATURALIST-SETTINGS" )}
        />
      </View>
    </View>
  );
};

export default LoggedInDefaultSettings;
