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
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

const IdentificationSection = ( ): Node => {
  const {
    currentObservation,
    updateObservationKeys,
    setPassesIdentificationTest,
    setLastScreen
  } = useContext( ObsEditContext );
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
        : {
          id: 48460,
          name: "Life",
          rank: "stateofmatter",
          rank_level: 100,
          default_photo: {
            url: "https://inaturalist-open-data.s3.amazonaws.com/photos/196425367/square.jpeg"
          }
        }
    } );
  };

  const navToSuggestions = ( ) => {
    setLastScreen( "ObsEdit" );
    navigation.navigate( "Suggestions" );
  };

  useEffect( ( ) => {
    if ( hasIdentification ) {
      setPassesIdentificationTest( true );
    }
  }, [hasIdentification, setPassesIdentificationTest] );

  return (
    <View className="ml-5 mt-6">
      <View className="flex-row">
        <Heading4>{t( "IDENTIFICATION" )}</Heading4>
        {hasIdentification && (
          <View className="ml-3">
            <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} />
          </View>
        )}
      </View>
      <View className="ml-1">
        {identification && (
          <View className="flex-row items-center justify-between mr-5 mt-5">
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
                  className={classnames( "rounded-full py-1 h-[36px]", {
                    "border border-darkGray border-[2px]": identification
                  } )}
                  testID="ObsEdit.Suggestions"
                  ignoreDark
                  icon={(
                    <INatIcon
                      name="sparkly-label"
                      size={24}
                      color={identification
                        ? theme.colors.primary
                        : theme.colors.onPrimary}
                    />
                  )}
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
