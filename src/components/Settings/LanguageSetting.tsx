import fetchAvailableLocales from "api/translations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import {
  Button,
  Heading4,
  PickerSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import changeLanguage from "sharedHelpers/changeLanguage";
import { useTranslation } from "sharedHooks";
import { zustandStorage } from "stores/useStore";

type LocalesResponse = {
  locale: string;
  language_in_locale: string;
}[];

interface Props {
  onChange: ( newLocale: string ) => void;
}

const LanguageSetting = ( { onChange }: Props ) => {
  const { t, i18n } = useTranslation();
  const [webLocales, setWebLocales] = useState<LocalesResponse>( [] );
  const webLocalesOptions = Object.fromEntries(
    webLocales?.map( locale => [locale.locale, {
      label: locale.language_in_locale,
      value: locale.locale,
    }] ),
  );
  const [localeSheetOpen, setLocaleSheetOpen] = useState( false );

  useEffect( () => {
    async function fetchLocales() {
      // Whenever possible, save latest available locales from server
      const currentLocales = zustandStorage.getItem( "availableLocales" );

      setWebLocales( currentLocales
        ? JSON.parse( currentLocales )
        : [] );

      const apiToken = await getJWT( );
      const locales = await fetchAvailableLocales( {}, { api_token: apiToken } );
      zustandStorage.setItem( "availableLocales", JSON.stringify( locales ) );
      setWebLocales( locales as LocalesResponse );
    }
    fetchLocales();
  }, [] );

  if ( webLocales.length === 0 ) {
    return null;
  }

  return (
    <View className="mb-9">
      <Heading4>{t( "APP-LANGUAGE" )}</Heading4>
      <Button
        className="mt-4"
        text={t( "CHANGE-APP-LANGUAGE" )}
        onPress={() => {
          setLocaleSheetOpen( true );
        }}
        accessibilityLabel={t( "CHANGE-APP-LANGUAGE" )}
      />
      {localeSheetOpen && (
        <PickerSheet
          headerText={t( "APP-LANGUAGE" )}
          confirm={( newLocale: string ) => {
            setLocaleSheetOpen( false );
            // Remember the new locale locally
            changeLanguage( newLocale );
            onChange( newLocale );
          }}
          onPressClose={() => setLocaleSheetOpen( false )}
          selectedValue={i18n.language}
          pickerValues={webLocalesOptions}
        />
      )}
    </View>
  );
};

export default LanguageSetting;
