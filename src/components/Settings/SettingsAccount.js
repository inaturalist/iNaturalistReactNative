// @flow

import CheckBox from "@react-native-community/checkbox";
import { Picker } from "@react-native-picker/picker";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

import inatLanguages from "../../dictionaries/languages";
import inatNetworks from "../../dictionaries/networks";
import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/settings/settings";
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
    <Pressable
      style={[viewStyles.row, viewStyles.notificationCheckbox]}
      onPress={() => onSettingsModified( {
        ...settings,
        prefers_no_tracking: !settings.prefers_no_tracking
      } )}
    >
      <CheckBox
        value={settings.prefers_no_tracking}
        onValueChange={v => onSettingsModified( { ...settings, prefers_no_tracking: v } )}
        tintColors={{ false: colors.inatGreen, true: colors.inatGreen }}
      />
      <Text style={[textStyles.checkbox, viewStyles.column]}>
        {t( "Do-not-collect-stability-and-usage-data-using-third-party-services" )}
      </Text>
    </Pressable>

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
