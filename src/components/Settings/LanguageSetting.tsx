import fetchAvailableLocales from "api/translations";
import {
  Button,
  Heading4,
  PickerSheet,
  UnderlinedLink,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import { openExternalWebBrowser } from "sharedHelpers/util";
import { useQuery, useTranslation } from "sharedHooks";

type LocalesResponse = {
  locale: string;
  language_in_locale: string;
}[];

type LocalesOptions = Record<string, { label: string; value: string }>

interface Props {
  onChange: ( newLocale: string ) => void;
}

const localesToOptions = (
  localesResponse?: LocalesResponse,
): LocalesOptions => Object.fromEntries(
  ( localesResponse ?? [] ).map( locale => [
    locale.locale,
    {
      label: locale.language_in_locale,
      value: locale.locale,
    },
  ] ),
);

const LanguageSetting = ( { onChange }: Props ) => {
  const { t, i18n } = useTranslation();
  const [localeSheetOpen, setLocaleSheetOpen] = useState( false );

  const { data: locales } = useQuery(
    ["fetchAvailableLocales"],
    ( ) => fetchAvailableLocales( {} ),
  );

  const localeOptions = localesToOptions( locales as LocalesResponse | undefined );

  if ( Object.keys( localeOptions ).length === 0 ) {
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
      <UnderlinedLink
        className="mt-[19px] text-center"
        accessibilityRole="link"
        onPress={async () => openExternalWebBrowser( "https://crowdin.com/project/inaturalistios" )}
      >
        {t( "Help-us-translate-the-app" )}
      </UnderlinedLink>
      {localeSheetOpen && (
        <PickerSheet
          headerText={t( "APP-LANGUAGE" )}
          confirm={( newLocale: string ) => {
            setLocaleSheetOpen( false );
            onChange( newLocale );
          }}
          onPressClose={() => setLocaleSheetOpen( false )}
          selectedValue={i18n.language}
          pickerValues={localeOptions}
        />
      )}
    </View>
  );
};

export default LanguageSetting;
