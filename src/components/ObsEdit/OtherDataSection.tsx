import { useNavigation } from "@react-navigation/native";
import {
  Heading4, TextInputSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { NoBottomTabStackScreenProps, TabStackScreenProps } from "navigation/types";
import React, { useState } from "react";
import { Alert } from "react-native";
import { useCurrentUser, useFeatureFlag, useTranslation } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

import DropdownItem from "./DropdownItem";
import GeoprivacySheet from "./Sheets/GeoprivacySheet";
import WildStatusSheet from "./Sheets/WildStatusSheet";

type Geoprivacy = null | "open" | "obscured" | "private";

type UpdateObservationKey =
  | {
      description: string | undefined;
    }
  | {
      geoprivacy: Geoprivacy;
    }
  | {
      captive_flag: boolean;
    };

interface Props {
  currentObservation: {
    captive_flag: boolean;
    description: string;
    geoprivacy: Geoprivacy;
    projectObservations: object[];
  };
  updateObservationKeys: ( _key: UpdateObservationKey ) => void;
}

const OtherDataSection = ( {
  currentObservation,
  updateObservationKeys,
}: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation<
    NoBottomTabStackScreenProps<"ObsEdit">["navigation"] &
    TabStackScreenProps<"ObsEdit">["navigation"]
  >( );
  const currentUser = useCurrentUser( );
  const [showGeoprivacySheet, setShowGeoprivacySheet] = useState( false );
  const [showWildStatusSheet, setShowWildStatusSheet] = useState( false );
  const [showNotesSheet, setShowNotesSheet] = useState( false );

  const geoprivacyOptions = [{
    label: t( "Open" ),
    value: "open" as const,
  },
  {
    label: t( "Obscured" ),
    value: "obscured" as const,
  },
  {
    label: t( "Private" ),
    value: "private" as const,
  }];

  // opposite of Seek (asking if wild, not if captive)
  const captiveOptions = [
    {
      label: t( "Data-quality-assessment-organism-is-wild" ),
      value: false,
    },
    {
      label: t( "Organism-is-captive" ),
      value: true,
    }];

  const traditionalProjectsEnabled = useFeatureFlag( FeatureFlag.TraditionalProjectsEnabled );

  const projectCount = currentObservation?.projectObservations?.length ?? 0;
  const projectsLabel = projectCount > 0
    ? t( "Added-to-X-Projects", { count: projectCount } )
    : t( "Add-to-Projects" );

  const currentGeoprivacyStatus = geoprivacyOptions
    .find( e => e.value === currentObservation?.geoprivacy );
  const currentCaptiveStatus = captiveOptions
    .find( e => e.value === currentObservation?.captive_flag );

  const handleProjectsPress = ( ) => {
    if ( !currentUser ) {
      Alert.alert(
        t( "Please-log-in" ),
        t( "You-need-to-be-logged-in-to-add-observations-to-projects" ),
      );
      return;
    }
    navigation.navigate( "AddToProjects" );
  };

  return (
    <View className="mx-5 mt-6">
      {showGeoprivacySheet && (
        <GeoprivacySheet
          selectedValue={currentObservation?.geoprivacy}
          onPressClose={( ) => setShowGeoprivacySheet( false )}
          updateGeoprivacyStatus={( value: Geoprivacy ) => updateObservationKeys( {
            geoprivacy: value,
          } )}
        />
      )}
      {showWildStatusSheet && (
        <WildStatusSheet
          selectedValue={currentObservation?.captive_flag || false}
          onPressClose={( ) => setShowWildStatusSheet( false )}
          updateCaptiveStatus={value => updateObservationKeys( {
            captive_flag: value,
          } )}
        />
      )}
      {showNotesSheet && (
        <TextInputSheet
          mentionsEnabled
          onPressClose={( ) => setShowNotesSheet( false )}
          headerText={t( "NOTES" )}
          placeholder={t( "Add-optional-notes" )}
          initialInput={currentObservation?.description}
          confirm={( textInput: string | undefined ) => updateObservationKeys( {
            description: textInput,
          } )}
        />
      )}
      <Heading4 className="pb-[10px]">{t( "OTHER-DATA" )}</Heading4>

      <DropdownItem
        accessibilityLabel={t( "Select-geoprivacy-status" )}
        handlePress={( ) => setShowGeoprivacySheet( true )}
        iconName="globe-outline"
        text={t( "Geoprivacy-status", {
          status: currentGeoprivacyStatus?.label || geoprivacyOptions[0].label,
        } )}
      />
      <DropdownItem
        accessibilityLabel={t( "Select-captive-or-cultivated-status" )}
        handlePress={( ) => setShowWildStatusSheet( true )}
        iconName="pot-outline"
        text={currentCaptiveStatus?.label || captiveOptions[0].label}
      />
      <DropdownItem
        accessibilityLabel={t( "Add-optional-notes" )}
        handlePress={( ) => setShowNotesSheet( true )}
        iconName="pencil-outline"
        text={currentObservation?.description || t( "Add-optional-notes" )}
      />
      {traditionalProjectsEnabled && (
        <DropdownItem
          accessibilityLabel={projectsLabel}
          handlePress={handleProjectsPress}
          iconName="briefcase"
          text={projectsLabel}
        />
      )}
    </View>
  );
};

export default OtherDataSection;
