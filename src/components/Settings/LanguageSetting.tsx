import fetchAvailableLocales from "api/translations";
import {
  Button,
  Heading4,
  PickerSheet
} from "components/SharedComponents";
import { SUPPORTED_LOCALES } from "i18n/loadTranslations";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "sharedHooks";
import { zustandStorage } from "stores/useStore";

type LocalesResponse = Array<{
  locale: string;
  language_in_locale: string;
}>;

type Props = {
  onChange: ( newLocale: string ) => void;
}

const LanguageSetting = ( { onChange }: Props ) => {
  const { t, i18n } = useTranslation();
  const [webLocales, setWebLocales] = useState<LocalesResponse>( [] );
  const webLocalesOptions = Object.fromEntries(
    webLocales?.map( locale => [locale.locale, {
      label: locale.language_in_locale,
      value: locale.locale
    }] )
  );
  const [localeSheetOpen, setLocaleSheetOpen] = useState( false );

  const offlineLocalesOptions = Object.fromEntries(
    _.values( SUPPORTED_LOCALES ).map( locale => [locale, {
      label: locale,
      value: locale
    }] )
  );

  useEffect( () => {
    async function fetchLocales() {
      // Whenever possible, save latest available locales from server
      const currentLocales = zustandStorage.getItem( "availableLocales" );

      setWebLocales( currentLocales
        ? JSON.parse( currentLocales )
        : [] );

      const locales = await fetchAvailableLocales();
      zustandStorage.setItem( "availableLocales", JSON.stringify( locales ) );
      setWebLocales( locales as LocalesResponse );
    }
    fetchLocales();
  }, [] );

  const localesOptions = webLocales.length > 0
    ? webLocalesOptions
    : offlineLocalesOptions;

  return (
    <>
      <Heading4 className="mt-7">{t( "APP-LANGUAGE" )}</Heading4>
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
            zustandStorage.setItem( "currentLocale", newLocale );
            i18n.changeLanguage( newLocale );
            onChange( newLocale );
          }}
          onPressClose={() => setLocaleSheetOpen( false )}
          selectedValue={i18n.language}
          pickerValues={localesOptions}
        />
      )}
    </>
  );
};

export default LanguageSetting;
