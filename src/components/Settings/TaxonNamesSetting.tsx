import {
  Body2,
  Heading4,
  RadioButtonRow
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React, { useCallback } from "react";
import {
  View
} from "react-native";
import type { TaxonNamesSettings } from "realmModels/User";
import User from "realmModels/User";
import {
  useCurrentUser,
  useTranslation
} from "sharedHooks";

const { useRealm } = RealmContext;

const NAME_DISPLAY_COM_SCI = "com-sci";
const NAME_DISPLAY_SCI_COM = "sci-com";
const NAME_DISPLAY_SCI = "sci";

type NameDisplayPref =
  typeof NAME_DISPLAY_COM_SCI | typeof NAME_DISPLAY_SCI_COM | typeof NAME_DISPLAY_SCI;

type Props = {
  onChange: ( options: TaxonNamesSettings ) => void;
};

const TaxonNamesSetting = ( { onChange }: Props ) => {
  const realm = useRealm( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const changeTaxonNameDisplay = useCallback( ( nameDisplayPref: NameDisplayPref ) => {
    const options: Partial<TaxonNamesSettings> = {};

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

    User.updatePreferences( realm, options );
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
        classNames="ml-[6px] mt-[15px]"
      />
      <RadioButtonRow
        smallLabel
        checked={scientificNameFirst}
        onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_SCI_COM )}
        label={t( "Scientific-Name-Common-Name" )}
        classNames="ml-[6px] mt-[15px]"
      />
      <RadioButtonRow
        smallLabel
        checked={scientificNameOnly}
        onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_SCI )}
        label={t( "Scientific-Name" )}
        classNames="ml-[6px] mt-[15px]"
      />
    </View>
  );
};

export default TaxonNamesSetting;
