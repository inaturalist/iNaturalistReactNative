// @flow

import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "components/SharedComponents";
import inatLicenses from "dictionaries/licenses";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import { textStyles, viewStyles } from "styles/settings/settings";
import colors from "styles/tailwindColors";

import PlaceSearchInput from "./PlaceSearchInput";
import type { SettingsProps } from "./types";

const PROJECT_SETTINGS = {
  any: "Any",
  joined: "Projects you've joined",
  none: "None, only you can add your observations to projects"
};

const TAXON_DISPLAY = {
  prefers_common_names: "Common Name (Scientific Name)",
  prefers_scientific_name_first: "Scientific Name (Common Name)",
  prefers_scientific_names: "Scientific Name"
};

const ADD_OBSERVATION_FIELDS = {
  anyone: "Anyone",
  curators: "Curators",
  observer: "Only you"
};

const LicenseSelector = ( {
  value,
  onValueChanged,
  title,
  updateExistingTitle,
  onUpdateExisting,
  updateExisting
} ): Node => (
  <>
    <Text style={textStyles.subTitle}>{title}</Text>
    <View style={viewStyles.selectorContainer}>
      <Picker
        style={viewStyles.selector}
        dropdownIconColor={colors.inatGreen}
        selectedValue={value}
        onValueChange={onValueChanged}
      >
        {inatLicenses.map( l => (
          <Picker.Item
            key={l.value}
            label={l.title}
            value={l.value}
          />
        ) )}
      </Picker>
    </View>
    <Checkbox
      isChecked={updateExisting}
      onPress={onUpdateExisting}
      text={updateExistingTitle}
    />
  </>
);

const SettingsContentDisplay = ( { settings, onSettingsModified }: SettingsProps ): Node => {
  let taxonNamePreference = "prefers_common_names";
  if ( settings.prefers_scientific_name_first ) {
    taxonNamePreference = "prefers_scientific_name_first";
  } else if ( settings.prefers_scientific_names ) {
    taxonNamePreference = "prefers_scientific_names";
  }

  return (
    <>
      <Text style={textStyles.title}>{t( "Project-Settings" )}</Text>
      <Text style={textStyles.subTitle}>
        {t( "Which-traditional-projects-can-add-your-observations" )}
      </Text>
      <View style={viewStyles.selectorContainer}>
        <Picker
          style={viewStyles.selector}
          dropdownIconColor={colors.inatGreen}
          selectedValue={settings.preferred_project_addition_by}
          onValueChange={( itemValue, _itemIndex ) => onSettingsModified( {
            ...settings,
            preferred_project_addition_by: itemValue
          } )}
        >
          {Object.keys( PROJECT_SETTINGS ).map( k => (
            <Picker.Item
              key={k}
              label={PROJECT_SETTINGS[k]}
              value={k}
            />
          ) )}
        </Picker>
      </View>

      <Text style={[textStyles.title, textStyles.marginTop]}>{t( "Taxonomy-Settings" )}</Text>
      <Checkbox
        isChecked={settings.prefers_automatic_taxonomic_changes}
        onPress={v => {
          onSettingsModified( { ...settings, prefers_automatic_taxonomic_changes: v } );
        }}
        text={t( "Automatically-update-my-content-for-taxon-changes" )}
      />
      <Text style={[textStyles.title, textStyles.marginTop]}>{t( "Names" )}</Text>
      <Text style={textStyles.subTitle}>{t( "Display" )}</Text>
      <Text>{t( "This-is-how-all-taxon-names-will-be-displayed-to-you-across-iNaturalist" )}</Text>
      <View style={viewStyles.selectorContainer}>
        <Picker
          style={viewStyles.selector}
          dropdownIconColor={colors.inatGreen}
          selectedValue={taxonNamePreference}
          onValueChange={( value, _itemIndex ) => {
            if ( value === "prefers_common_names" ) {
              onSettingsModified( {
                ...settings,
                prefers_common_names: true,
                prefers_scientific_name_first: false
              } );
            } else if ( value === "prefers_scientific_name_first" ) {
              onSettingsModified( {
                ...settings,
                prefers_common_names: true,
                prefers_scientific_name_first: true
              } );
            } else if ( value === "prefers_scientific_names" ) {
              onSettingsModified( {
                ...settings,
                prefers_common_names: false,
                prefers_scientific_name_first: false
              } );
            }
          }}
        >
          {Object.keys( TAXON_DISPLAY ).map( k => (
            <Picker.Item
              key={k}
              label={TAXON_DISPLAY[k]}
              value={k}
            />
          ) )}
        </Picker>
      </View>
      <Text style={textStyles.subTitle}>{t( "Prioritize-common-names-used-in-this-place" )}</Text>
      <PlaceSearchInput
        placeId={settings.place_id}
        onPlaceChanged={p => onSettingsModified( { ...settings, place_id: p } )}
      />

      <Text style={[textStyles.title, textStyles.marginTop]}>
        {t( "Community-Moderation-Settings" )}
      </Text>
      <Checkbox
        isChecked={settings.prefers_community_taxa}
        onPress={v => {
          onSettingsModified( { ...settings, prefers_community_taxa: v } );
        }}
        text={t( "Accept-community-identifications" )}
      />
      <Text style={textStyles.subTitle}>
        {t( "Who-can-add-observation-fields-to-my-observations" )}
      </Text>
      <View style={viewStyles.selectorContainer}>
        <Picker
          style={viewStyles.selector}
          dropdownIconColor={colors.inatGreen}
          selectedValue={settings.preferred_observation_fields_by}
          onValueChange={( itemValue, _itemIndex ) => onSettingsModified( {
            ...settings,
            preferred_observation_fields_by: itemValue
          } )}
        >
          {Object.keys( ADD_OBSERVATION_FIELDS ).map( k => (
            <Picker.Item
              key={k}
              label={ADD_OBSERVATION_FIELDS[k]}
              value={k}
            />
          ) )}
        </Picker>
      </View>

      <Text style={[textStyles.title, textStyles.marginTop]}>{t( "Licensing" )}</Text>
      <LicenseSelector
        title="Default observation license"
        value={settings.preferred_observation_license}
        onValueChanged={v => onSettingsModified( {
          ...settings,
          preferred_observation_license: v
        } )}
        updateExistingTitle="Update existing observations with new license choices"
        updateExisting={settings.make_observation_licenses_same}
        onUpdateExisting={v => onSettingsModified( {
          ...settings,
          make_observation_licenses_same: v
        } )}
      />
      <LicenseSelector
        title="Default photo license"
        value={settings.preferred_photo_license}
        onValueChanged={v => onSettingsModified( { ...settings, preferred_photo_license: v } )}
        updateExistingTitle="Update existing photos with new license choices"
        updateExisting={settings.make_photo_licenses_same}
        onUpdateExisting={v => onSettingsModified( { ...settings, make_photo_licenses_same: v } )}
      />
      <LicenseSelector
        title="Default sound license"
        value={settings.preferred_sound_license}
        onValueChanged={v => onSettingsModified( { ...settings, preferred_sound_license: v } )}
        updateExistingTitle="Update existing sounds with new license choices"
        updateExisting={settings.make_sound_licenses_same}
        onUpdateExisting={v => onSettingsModified( { ...settings, make_sound_licenses_same: v } )}
      />
    </>
  );
};

export default SettingsContentDisplay;
