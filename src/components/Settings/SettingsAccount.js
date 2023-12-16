// @flow

import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "components/SharedComponents";
import inatLanguages from "dictionaries/languages";
import inatNetworks from "dictionaries/networks";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import { textStyles, viewStyles } from "styles/settings/settings";
import colors from "styles/tailwindColors";

import PlaceSearchInput from "./PlaceSearchInput";
import type { SettingsProps } from "./types";

const SettingsAccount = ( { settings, onSettingsModified }: SettingsProps ): Node => (
  <>
    <Text style={textStyles.title}>{t( "Account" )}</Text>

    <Text style={[textStyles.subTitle]}>{t( "Language-Locale" )}</Text>
    <Text>{t( "This-sets-your-language-and-date-formatting-preferences-across-iNaturalist" )}</Text>
    <View style={viewStyles.selectorContainer}>
      <Picker
        style={viewStyles.selector}
        dropdownIconColor={colors.inatGreen}
        selectedValue={settings.locale}
        onValueChange={
          ( itemValue, _itemIndex ) => onSettingsModified( { ...settings, locale: itemValue } )
        }
      >
        {Object.keys( inatLanguages ).map( k => (
          <Picker.Item
            key={k}
            label={inatLanguages[k]}
            value={k}
          />
        ) )}
      </Picker>
    </View>

    <Text style={[textStyles.subTitle]}>{t( "Default-Search-Place" )}</Text>
    <Text>{t( "This-will-be-your-default-place-for-all-searches-in-Explore-and-Identify" )}</Text>
    <PlaceSearchInput
      placeId={settings.search_place_id}
      onPlaceChanged={p => onSettingsModified( { ...settings, search_place_id: p } )}
    />

    <Text style={[textStyles.subTitle]}>{t( "Privacy" )}</Text>
    <Checkbox
      isChecked={settings.prefers_no_tracking}
      onPress={v => onSettingsModified( { ...settings, prefers_no_tracking: v } )}
      text={t( "Do-not-collect-stability-and-usage-data-using-third-party-services" )}
    />
    <Text style={[textStyles.subTitle]}>{t( "iNaturalist-Network-Affiliation" )}</Text>
    <View style={viewStyles.selectorContainer}>
      <Picker
        style={viewStyles.selector}
        dropdownIconColor={colors.inatGreen}
        selectedValue={settings.site_id}
        onValueChange={
          ( itemValue, _itemIndex ) => onSettingsModified( { ...settings, site_id: itemValue } )
        }
      >
        {Object.keys( inatNetworks ).map( k => (
          <Picker.Item
            key={k}
            label={inatNetworks[k].name}
            value={k}
          />
        ) )}
      </Picker>
    </View>
    <Text>{t( "The-iNaturalist-Network-is-a-collection-of-localized-websites" )}</Text>

  </>
);

export default SettingsAccount;
