// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Button,
  Heading4,
  IconicTaxonChooser,
  INatIcon,
  TaxonResult
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { capitalize } from "lodash";
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

  const identTaxon = currentObservation?.taxon;
  const hasPhotos = currentObservation?.observationPhotos?.length > 0;

  const hasIdentification = identTaxon && identTaxon.rank_level !== 100;

  const showIconicTaxonChooser = !identTaxon
    || identTaxon.name === identTaxon.iconic_taxon_name
    || identTaxon.isIconic
    || identTaxon.name === "Life";

  const navToSuggestions = useCallback( ( ) => {
    if ( hasPhotos ) {
      navigation.push( "Suggestions", { entryScreen: "ObsEdit", lastScreen: "ObsEdit" } );
    } else {
      // Go directly to taxon search in case there are no photos
      navigation.navigate( "TaxonSearch", { entryScreen: "ObsEdit", lastScreen: "ObsEdit" } );
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
            level={identTaxon
              ? "neutral"
              : "focus"}
            onPress={navToSuggestions}
            text={t( "ADD-AN-ID" )}
            className={classnames( "rounded-full py-1 h-[36px] ml-4", {
              "border border-darkGray border-[2px]": identTaxon
            } )}
            testID="ObsEdit.Suggestions"
            icon={(
              <INatIcon
                name="sparkly-label"
                size={24}
                color={identTaxon
                  ? theme.colors.primary
                  : theme.colors.onPrimary}
              />
            )}
            accessibilityLabel={t( "View-suggestions" )}
          />
        )}
        chosen={
          identTaxon
            ? [identTaxon.name.toLowerCase()]
            : []
        }
        onTaxonChosen={taxonName => {
          const capitalizedTaxonName = capitalize( taxonName );
          if (
            // user chose unknown
            taxonName === "unknown"
            // user tapped the selected iconic taxon to unselect
            || identTaxon?.name === capitalizedTaxonName
          ) {
            updateObservationKeys( { taxon: undefined } );
          } else {
            const newTaxon = realm?.objects( "Taxon" )
              .filtered( "name = $0", capitalizedTaxonName )[0];
            updateObservationKeys( { taxon: newTaxon } );
          }
        }}
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
      {identTaxon && (
        <View className="mt-5 mx-5">
          <TaxonResult
            accessibilityLabel={t( "Edits-this-observations-taxon" )}
            asListItem={false}
            handlePress={navToSuggestions}
            hideNavButtons
            taxon={identTaxon}
            hideInfoButton
            showCheckmark={false}
            showEditButton
          />
        </View>
      )}
      <View className="mt-5">
        {showIconicTaxonChooser && renderIconicTaxonChooser( )}
      </View>
    </View>
  );
};

export default IdentificationSection;
