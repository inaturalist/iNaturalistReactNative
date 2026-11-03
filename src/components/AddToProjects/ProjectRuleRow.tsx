import {
  Body1, Body4, DisplayTaxon, INatIcon,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TFunction } from "i18next";
import React from "react";
import type {
  ProjectRuleGroup,
  ProjectRuleStatus,
} from "sharedHelpers/validateProjectRulesForObservation";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  group: ProjectRuleGroup;
}

const ruleHeader = ( operator: string, t: TFunction ) => {
  switch ( operator ) {
    case "captive?":
      return t( "Captive-Cultivated" );
    case "wild?":
      return t( "Wild" );
    case "coordinates_shareable_by_project_curators?":
      return t( "Location-permissions--project-rule" );
    case "georeferenced?":
      return t( "Location" );
    case "observed_in_place?":
      return t( "Specific-location--project-rule" );
    case "has_a_photo?":
      return t( "Photo--project-rule" );
    case "has_a_sound?":
      return t( "Sound--project-rule" );
    case "has_media?":
      return t( "Media--project-rule" );
    case "verifiable?":
      return t( "Verifiable--project-rule" );
    case "identified?":
      return t( "Identification--project-rule" );
    case "in_taxon?":
      return t( "Specific-identification--project-rule" );
    case "on_list?":
      return t( "Must-be-on-Project-List--project-rule" );
    default:
      return null;
  }
};

const renderStatusIcon = ( status: ProjectRuleStatus ) => {
  switch ( status ) {
    case "pass":
      return <INatIcon name="checkmark-circle" color={colors.inatGreen} size={19} />;
    case "fail":
      return <INatIcon name="triangle-exclamation" color={colors.warningRed} size={19} />;
    default:
      return null;
  }
};

const ProjectRuleRow = ( { group }: Props ) => {
  const { t } = useTranslation( );

  return (
    <View
      className="px-4 py-2.5"
      testID={`ProjectRuleRow.${group.projectId}.${group.operator}`}
    >
      <View className="flex-row justify-between items-center">
        <Body1 className="flex-1">{ruleHeader( group.operator, t )}</Body1>
        <View className="flex-row items-center">
          <Body4 className="mr-2.5">{t( "Required" )}</Body4>
          {renderStatusIcon( group.status )}
        </View>
      </View>
      {group.operator === "in_taxon?" && group.rules.map( rule => rule.taxon && (
        <View className="px-2.5 pt-4" key={rule.id}>
          <DisplayTaxon taxon={rule.taxon} />
        </View>
      ) )}
    </View>
  );
};

export default ProjectRuleRow;
