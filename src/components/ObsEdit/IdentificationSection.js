// @flow

import { useNavigation } from "@react-navigation/native";
import DisplayTaxonName from "components/DisplayTaxonName";
import {
  Button, Heading4, INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect } from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

const IdentificationSection = ( ): Node => {
  const {
    currentObservation,
    updateObservationKey,
    setPassesIdentificationTest
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const theme = useTheme( );
  const navigation = useNavigation( );

  const identification = currentObservation.taxon;

  const hasIdentification = identification && identification.rank_level !== 100;

  const onIDAdded = async id => updateObservationKey( "taxon", id.taxon );

  const navToAddID = ( ) => navigation.navigate( "AddID", {
    onIDAdded,
    hideComment: true,
    goBackOnSave: true,
    clearSearch: true
  } );

  const displayIdentification = ( ) => (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center mb-5"
      onPress={navToAddID}
    >
      <INatIcon name="label-outline" size={14} />
      <View className="ml-5">
        <DisplayTaxonName taxon={identification} small />
      </View>
    </Pressable>
  );

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
      <View className="mt-5 ml-1">
        {identification && displayIdentification( )}
        <View className="flex-row justify-start">
          <Button
            level={identification ? "neutral" : "focus"}
            onPress={navToAddID}
            text={t( "ADD-AN-ID" )}
            className="rounded-full py-2"
            testID="ObsEdit.Suggestions"
            icon={(
              <INatIcon
                name="sparkly-label"
                size={24}
                color={identification ? theme.colors.primary : theme.colors.onPrimary}
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default IdentificationSection;
