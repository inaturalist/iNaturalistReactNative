// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Button, DisplayTaxon,
  Heading4, IconicTaxonChooser,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

type Props = {
  passesIdentificationTest: boolean,
  setPassesIdentificationTest: Function,
  currentObservation: Object,
  updateObservationKeys: Function
}

const IdentificationSection = ( {
  passesIdentificationTest,
  setPassesIdentificationTest,
  currentObservation,
  updateObservationKeys
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const navigation = useNavigation( );
  const realm = useRealm( );

  const identification = currentObservation?.taxon;

  const hasIdentification = identification && identification.rank_level !== 100;

  const onTaxonChosen = taxonName => {
    const selectedTaxon = realm?.objects( "Taxon" ).filtered( "name CONTAINS[c] $0", taxonName );
    updateObservationKeys( {
      taxon: selectedTaxon.length > 0
        ? selectedTaxon[0]
        : null
    } );
  };

  const navToSuggestions = useCallback( ( ) => {
    navigation.navigate( "Suggestions", { lastScreen: "ObsEdit" } );
  }, [navigation] );

  useEffect( ( ) => {
    if ( hasIdentification && !passesIdentificationTest ) {
      setPassesIdentificationTest( true );
    }
  }, [hasIdentification, setPassesIdentificationTest, passesIdentificationTest] );

  return (
    <View className="mt-6">
      <View className="ml-5 flex-row">
        <Heading4>{t( "IDENTIFICATION" )}</Heading4>
        {hasIdentification && (
          <View className="ml-3">
            <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} />
          </View>
        )}
      </View>
      <View className="ml-1">
        {identification && (
          <View className="flex-row items-center justify-between mr-5 mt-5 ml-5">
            <DisplayTaxon
              taxon={identification}
              handlePress={navToSuggestions}
              accessibilityLabel={t( "Navigates-to-add-identification" )}
            />
            <INatIconButton
              icon="edit"
              size={20}
              onPress={navToSuggestions}
              accessibilityLabel={t( "Edit" )}
              accessibilityHint={t( "Navigates-to-add-identification" )}
            />
          </View>
        )}
        <View className="mt-5">
          {( !identification
            || identification.name === identification.iconic_taxon_name
            || identification.isIconic
            || identification.name === "Life"
          ) && (
            <IconicTaxonChooser
              before={(
                <Button
                  level={identification
                    ? "neutral"
                    : "focus"}
                  onPress={navToSuggestions}
                  text={t( "ADD-AN-ID" )}
                  className={classnames( "rounded-full py-1 h-[36px] ml-4", {
                    "border border-darkGray border-[2px]": identification
                  } )}
                  testID="ObsEdit.Suggestions"
                  icon={(
                    <INatIcon
                      name="sparkly-label"
                      size={24}
                      color={identification
                        ? theme.colors.primary
                        : theme.colors.onPrimary}
                    />
                  )}
                  accessibilityLabel={t( "Navigate-to-identification-suggestions-screen" )}
                />
              )}
              taxon={identification}
              onTaxonChosen={onTaxonChosen}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default IdentificationSection;
