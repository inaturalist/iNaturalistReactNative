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
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

type Props = {
  currentObservation: Object,
  resetScreen: boolean,
  setResetScreen: Function,
  updateObservationKeys: Function
}

const IdentificationSection = ( {
  currentObservation,
  resetScreen,
  setResetScreen,
  updateObservationKeys
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const realm = useRealm( );

  const identTaxon = currentObservation?.taxon;
  const hasPhotos = currentObservation?.observationPhotos?.length > 0;

  const hasIdentification = identTaxon && identTaxon.rank_level !== 100;

  const removeTaxon = useCallback( ( ) => {
    updateObservationKeys( { taxon: undefined } );
  }, [updateObservationKeys] );

  const navToSuggestions = useCallback( ( ) => {
    if ( hasPhotos ) {
      navigation.push( "Suggestions", {
        entryScreen: "ObsEdit",
        lastScreen: "ObsEdit",
        hideSkip: hasIdentification
      } );
    } else {
      // Go directly to taxon search in case there are no photos
      navigation.navigate( "SuggestionsTaxonSearch", {
        entryScreen: "ObsEdit",
        lastScreen: "ObsEdit"
      } );
    }
  }, [
    hasIdentification,
    hasPhotos,
    navigation
  ] );

  const navToSuggestionsSearch = useCallback( ( ) => {
    navigation.navigate( "SuggestionsTaxonSearch", {
      entryScreen: "ObsEdit",
      lastScreen: "ObsEdit"
    } );
  }, [navigation] );

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
          <View className="flex-row ml-6">
            {hasPhotos
              ? (
                <Button
                  level={identTaxon
                    ? "neutral"
                    : "focus"}
                  onPress={navToSuggestions}
                  text={t( "ID-WITH-AI" )}
                  className={classnames( "rounded-full py-1 mr-4 h-[36px]", {
                    "border border-darkGray border-[2px]": identTaxon
                  } )}
                  testID="ObsEdit.Suggestions"
                  icon={(
                    <INatIcon
                      name="sparkly-label"
                      size={24}
                      color={identTaxon
                        ? colors.darkGray
                        : colors.white}
                    />
                  )}
                  accessibilityLabel={t( "View-suggestions" )}
                />
              )
              : null}
            <Button
              level="neutral"
              onPress={navToSuggestionsSearch}
              text={t( "SEARCH" )}
              className="rounded-full py-1 h-[36px] border border-darkGray border-[2px]"
              testID="ObsEdit.Suggestions"
              icon={(
                <INatIcon
                  name="magnifying-glass"
                  size={18}
                  color={colors.darkGray}
                />
              )}
              accessibilityLabel={t( "View-suggestions" )}
            />
          </View>
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
        withoutUnknown
      />
    </View>
  );

  return (
    <View className="mt-2">
      <View className="ml-6 flex-row">
        <Heading4>{t( "IDENTIFICATION" )}</Heading4>
        {hasIdentification && (
          <View className="ml-3">
            <INatIcon name="checkmark-circle" size={19} color={colors.inatGreen} />
          </View>
        )}
      </View>
      {identTaxon && (
        <View className="mt-5 mx-6">
          <TaxonResult
            accessibilityLabel={t( "Edits-this-observations-taxon" )}
            asListItem={false}
            fetchRemote={false}
            handleTaxonOrEditPress={navToSuggestions}
            handleRemovePress={removeTaxon}
            hideInfoButton
            hideNavButtons
            showCheckmark={false}
            showEditButton
            showRemoveButton
            taxon={identTaxon}
          />
        </View>
      )}
      <View className="mt-5">
        {renderIconicTaxonChooser( )}
      </View>
    </View>
  );
};

export default IdentificationSection;
