import {Image, Text, TextInput, View} from "react-native";
import {viewStyles, textStyles} from "../../styles/settings/settings";
import React, {useEffect} from "react";
import {Picker} from "@react-native-picker/picker";
import {useDebounce} from "use-debounce";
import {colors} from "../../styles/global";
import inatjs from "inaturalistjs";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import CheckBox from "@react-native-community/checkbox";
import {inatPlaceTypes} from "../../dictionaries/places";
import {inatLanguages} from "../../dictionaries/languages";
import {inatTimezones} from "../../dictionaries/timezones";
import {inatNetworks} from "../../dictionaries/networks";
import PlaceSearchInput from "./PlaceSearchInput";

const SettingsAccount = ( { settings, onSettingsModified } ): React.Node => {

  return (
    <>
      <Text style={textStyles.title}>Account</Text>

      <Text style={textStyles.subTitle}>Time Zone</Text>
      <Text>All your observations will default to this time zone unless you specify otherwise.</Text>
      <View style={viewStyles.selectorContainer}>
        <Picker
          style={viewStyles.selector}
          dropdownIconColor={colors.inatGreen}
          selectedValue={settings.time_zone}
          onValueChange={( itemValue, itemIndex ) =>
            onSettingsModified( { ...settings, time_zone: itemValue } )
          }>
          {Object.keys( inatTimezones ).map( ( k ) => (
            <Picker.Item
              key={k}
              label={inatTimezones[k]}
              value={k} />
          ) )}
        </Picker>
      </View>

      <Text style={[textStyles.subTitle]}>Language/Locale</Text>
      <Text>This sets your language and date formatting preferences across iNaturalist based on your locale.</Text>
      <View style={viewStyles.selectorContainer}>
        <Picker
          style={viewStyles.selector}
          dropdownIconColor={colors.inatGreen}
          selectedValue={settings.locale}
          onValueChange={( itemValue, itemIndex ) =>
            onSettingsModified( { ...settings, locale: itemValue } )
          }>
          {Object.keys( inatLanguages ).map( ( k ) => (
            <Picker.Item
              key={k}
              label={inatLanguages[k]}
              value={k} />
          ) )}
        </Picker>
      </View>

      <Text style={[textStyles.subTitle]}>Default Search Place</Text>
      <Text>This will be your default place for all searches in Explore and Identify.</Text>
      <PlaceSearchInput placeId={settings.search_place_id} onPlaceChanged={( p ) => onSettingsModified( { ...settings, search_place_id: p} )} />

      <Text style={[textStyles.subTitle]}>Privacy</Text>
      <Text>This will be your default place for all searches in Explore and Identify.</Text>
      <Pressable style={[viewStyles.row, viewStyles.notificationCheckbox]}
                 onPress={() => onSettingsModified( { ...settings, prefers_no_tracking: !settings.prefers_no_tracking} )}>
        <CheckBox
          value={settings.prefers_no_tracking}
          onValueChange={( v ) => onSettingsModified( { ...settings, prefers_no_tracking: v} )}
          tintColors={{false: colors.inatGreen, true: colors.inatGreen}}
        />
        <Text style={[textStyles.checkbox, viewStyles.column]}>Do not collect stability and usage data using third-party services</Text>
      </Pressable>


      <Text style={[textStyles.subTitle]}>iNaturalist Network Affiliation</Text>
      <View style={viewStyles.selectorContainer}>
        <Picker
          style={viewStyles.selector}
          dropdownIconColor={colors.inatGreen}
          selectedValue={settings.site_id}
          onValueChange={( itemValue, itemIndex ) =>
            onSettingsModified( { ...settings, site_id: itemValue } )
          }>
          {Object.keys( inatNetworks ).map( ( k ) => (
            <Picker.Item
              key={k}
              label={inatNetworks[k].name}
              value={k} />
          ) )}
        </Picker>
      </View>
      <Text>The iNaturalist Network is a collection of localized websites that are fully connected to the global iNaturalist community. Network sites are supported by local institutions that have signed an agreement with iNaturalist to promote local use and benefit local biodiversity. They have access to true coordinates from their countries that are automatically obscured from public view in order to protect threatened species.
        Your username and password works on all sites that are part of the iNaturalist Network. If you choose to affiliate with a Network site, the local institutions that operate each site will also have access to your email address (only to communicate with you about site activities) and access to the true coordinates for observations that are publicly obscured or private.
        Note: Please do not experimentally change your affiliation if you have more than 1000 observations.</Text>


    </>
  );
};

export default SettingsAccount;
