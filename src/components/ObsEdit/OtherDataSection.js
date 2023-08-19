// @flow

import {
  Body3, Heading4, INatIcon, TextInputSheet
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

import GeoprivacySheet from "./Sheets/GeoprivacySheet";
import WildStatusSheet from "./Sheets/WildStatusSheet";

const OtherDataSection = ( ): Node => {
  const { t } = useTranslation( );
  const [showGeoprivacySheet, setShowGeoprivacySheet] = useState( false );
  const [showWildStatusSheet, setShowWildStatusSheet] = useState( false );
  const [showNotesSheet, setShowNotesSheet] = useState( false );

  const {
    currentObservation,
    updateObservationKeys
  } = useContext( ObsEditContext );

  const geoprivacyOptions = [{
    label: t( "Open" ),
    value: "open"
  },
  {
    label: t( "Obscured" ),
    value: "obscured"
  },
  {
    label: t( "Private" ),
    value: "private"
  }];

  // opposite of Seek (asking if wild, not if captive)
  const captiveOptions = [
    {
      label: t( "Organism-is-wild" ),
      value: false
    },
    {
      label: t( "Organism-is-captive" ),
      value: true
    }];

  const updateGeoprivacyStatus = value => updateObservationKeys( {
    geoprivacy: value
  } );
  const updateCaptiveStatus = value => updateObservationKeys( {
    captive_flag: value
  } );

  const currentGeoprivacyStatus = geoprivacyOptions
    .find( e => e.value === currentObservation?.geoprivacy );
  const currentCaptiveStatus = captiveOptions
    .find( e => e.value === currentObservation?.captive_flag );

  return (
    <View className="ml-5 mt-6">
      {showGeoprivacySheet && (
        <GeoprivacySheet
          selectedValue={currentObservation?.geoprivacy}
          handleClose={( ) => setShowGeoprivacySheet( false )}
          updateGeoprivacyStatus={updateGeoprivacyStatus}
        />
      )}
      {showWildStatusSheet && (
        <WildStatusSheet
          selectedValue={currentObservation?.captive_flag}
          handleClose={( ) => setShowWildStatusSheet( false )}
          updateCaptiveStatus={updateCaptiveStatus}
        />
      )}
      <Heading4>{t( "OTHER-DATA" )}</Heading4>
      <Pressable
        className="flex-row flex-nowrap items-center ml-1 mt-5"
        onPress={( ) => setShowGeoprivacySheet( true )}
        accessibilityRole="button"
      >
        <INatIcon
          name="globe-outline"
          size={14}
        />
        <Body3 className="ml-5">
          {t( "Geoprivacy" )}
          {" "}
          {currentGeoprivacyStatus?.label || geoprivacyOptions[0].label}
        </Body3>
      </Pressable>
      <Pressable
        className="flex-row flex-nowrap items-center ml-1 mt-5"
        onPress={( ) => setShowWildStatusSheet( true )}
        accessibilityRole="button"
      >
        <INatIcon
          name="pot-outline"
          size={14}
        />
        <Body3 className="ml-5">
          {currentCaptiveStatus?.label || captiveOptions[0].label}
        </Body3>
      </Pressable>
      <View className="flex-row flex-nowrap items-center ml-1 mt-2.5">
        {showNotesSheet && (
          <TextInputSheet
            handleClose={( ) => setShowNotesSheet( false )}
            headerText={t( "NOTES" )}
            snapPoints={[416]}
            placeholder={t( "Add-optional-notes" )}
            initialInput={currentObservation?.description}
            confirm={textInput => updateObservationKeys( {
              description: textInput
            } )}
          />
        )}
        <INatIcon
          size={14}
          name="pencil-outline"
        />
        <Body3
          onPress={( ) => setShowNotesSheet( true )}
          className="pl-5 py-3"
        >
          {currentObservation?.description || t( "Add-optional-notes" )}
        </Body3>
      </View>
    </View>
  );
};

export default OtherDataSection;
