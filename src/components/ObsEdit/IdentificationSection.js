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
  currentObservation: Object,
  resetScreen: boolean,
  setResetScreen: Function,
  passesIdentificationTest: boolean,
  setPassesIdentificationTest: Function,
  updateObservationKeys: Function
}

const IdentificationSection = ( {
  currentObservation,
  resetScreen,
  setResetScreen,
  passesIdentificationTest,
  setPassesIdentificationTest,
  updateObservationKeys
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const navigation = useNavigation( );
  const realm = useRealm( );

  const identification = currentObservation?.taxon;
  const hasPhotos = currentObservation?.observationPhotos?.length > 0;

  const hasIdentification = identification && identification.rank_level !== 100;

  const showIconicTaxonChooser = !identification
    || identification.name === identification.iconic_taxon_name
    || identification.isIconic
    || identification.name === "Life";

  const onTaxonChosen = taxonName => updateObservationKeys( {
    taxon: realm?.objects( "Taxon" ).filtered( "name CONTAINS[c] $0", taxonName )[0]
  } );

  const navToSuggestions = useCallback( ( ) => {
    if ( hasPhotos ) {
      navigation.navigate( "Suggestions", { lastScreen: "ObsEdit" } );
    } else {
      // Go directly to taxon search in case there are no photos
      navigation.navigate( "TaxonSearch", { lastScreen: "ObsEdit" } );
    }
  }, [hasPhotos, navigation] );

  useEffect( ( ) => {
    if ( hasIdentification && !passesIdentificationTest ) {
      setPassesIdentificationTest( true );
    }
  }, [hasIdentification, setPassesIdentificationTest, passesIdentificationTest] );

  useEffect( ( ) => {
    // by adding resetScreen as a key in renderIconicTaxonChooser,
    // we force React to rerender and reset the horizontal scroll position
    // when a user navigates between multiple observations
    if ( resetScreen ) {
      setResetScreen( false );
    }
  }, [resetScreen, setResetScreen] );

  const renderIconicTaxonChooser = ( ) => (
    <View key={resetScreen?.toString( )}>
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
            accessibilityLabel={t( "View-suggestions" )}
          />
        )}
        taxon={identification}
        onTaxonChosen={onTaxonChosen}
      />
    </View>
  );

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
              accessibilityLabel={t( "Edits-this-observations-taxon" )}
            />
            <INatIconButton
              icon="edit"
              size={20}
              onPress={navToSuggestions}
              accessibilityLabel={t( "Edit" )}
              accessibilityHint={t( "Edits-this-observations-taxon" )}
            />
          </View>
        )}
        <View className="mt-5">
          {showIconicTaxonChooser && renderIconicTaxonChooser( )}
        </View>
      </View>
    </View>
  );
};

export default IdentificationSection;
