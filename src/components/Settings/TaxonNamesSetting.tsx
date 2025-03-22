import {
  Body2,
  Heading4,
  RadioButtonRow
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback } from "react";
import {
  View
} from "react-native";
// import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useCurrentUser,
  useTranslation
} from "sharedHooks";

// const logger = log.extend( "TaxonNamesSetting" );

const { useRealm } = RealmContext;

const NAME_DISPLAY_COM_SCI = "com-sci";
const NAME_DISPLAY_SCI_COM = "sci-com";
const NAME_DISPLAY_SCI = "sci";

type Props = {
  onChange: ( options: {
    prefers_common_names: boolean,
    prefers_scientific_name_first: boolean
  } ) => void;
}

const TaxonNamesSetting = ( { onChange }: Props ) => {
  const realm = useRealm( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const changeTaxonNameDisplay = useCallback( nameDisplayPref => {
    const options = {};

    // logger.info( `Changing taxon name display to: ${nameDisplayPref}` );

    if ( nameDisplayPref === NAME_DISPLAY_COM_SCI ) {
      options.prefers_common_names = true;
      options.prefers_scientific_name_first = false;
    } else if ( nameDisplayPref === NAME_DISPLAY_SCI_COM ) {
      options.prefers_common_names = true;
      options.prefers_scientific_name_first = true;
    } else if ( nameDisplayPref === NAME_DISPLAY_SCI ) {
      options.prefers_common_names = false;
      options.prefers_scientific_name_first = false;
    }

    // logger.info( "Writing to realm with options:", options );

    safeRealmWrite( realm, ( ) => {
      currentUser.prefers_common_names = options.prefers_common_names;
      currentUser.prefers_scientific_name_first = options.prefers_scientific_name_first;
      // logger.info(
      // eslint-disable-next-line max-len
      // `Realm updated for user ${currentUser.login}, prefers_common_names: ${currentUser.prefers_common_names}, prefers_scientific_name_first: ${currentUser.prefers_scientific_name_first}`;
      // );
    }, "saving user in TaxonNamesSetting" );
    onChange( options );
    return currentUser;
  }, [currentUser, realm, onChange] );

  if ( !currentUser ) {
    return null;
  }

  const commonNameFirst = currentUser.prefers_common_names
    && !currentUser.prefers_scientific_name_first;

  const scientificNameFirst = currentUser.prefers_common_names
    && currentUser.prefers_scientific_name_first;

  const scientificNameOnly = !currentUser.prefers_common_names
    && !currentUser.prefers_scientific_name_first;

  return (
    <View className="mb-9">
      <Heading4>{t( "TAXON-NAMES-DISPLAY" )}</Heading4>
      <Body2 className="mt-3">{t( "This-is-how-taxon-names-will-be-displayed" )}</Body2>
      <RadioButtonRow
        smallLabel
        checked={commonNameFirst}
        onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_COM_SCI )}
        label={t( "Common-Name-Scientific-Name" )}
        classNames="mt-[22px]"
      />
      <RadioButtonRow
        smallLabel
        checked={scientificNameFirst}
        onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_SCI_COM )}
        label={t( "Scientific-Name-Common-Name" )}
        classNames="mt-4"
      />
      <RadioButtonRow
        smallLabel
        checked={scientificNameOnly}
        onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_SCI )}
        label={t( "Scientific-Name" )}
        classNames="mt-4"
      />
    </View>
  );
};

export default TaxonNamesSetting;
