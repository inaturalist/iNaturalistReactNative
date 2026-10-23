import {
  Body1, Body4, DisplayTaxon, INatIcon,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TFunction } from "i18next";
import React from "react";
import type {
  DisplayedRuleOperator,
  ProjectRuleGroup,
  ProjectRuleStatus,
} from "sharedHelpers/validateProjectRulesForObservation";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  group: ProjectRuleGroup;
  projectId: number;
}

const ruleHeader = ( operator: DisplayedRuleOperator, t: TFunction ) => {
  const headers: Record<DisplayedRuleOperator, string> = {
    "captive?": t( "Captive-Cultivated" ),
    "wild?": t( "Wild" ),
    "coordinates_shareable_by_project_curators?": t( "Location-permissions--project-rule" ),
    "georeferenced?": t( "Location" ),
    "observed_in_place?": t( "Specific-location--project-rule" ),
    "has_a_photo?": t( "Photo--project-rule" ),
    "has_a_sound?": t( "Sound--project-rule" ),
    "has_media?": t( "Media--project-rule" ),
    "verifiable?": t( "Verifiable--project-rule" ),
    "identified?": t( "Identification--project-rule" ),
    "in_taxon?": t( "Specific-identification--project-rule" ),
    "on_list?": t( "Must-be-on-Project-List--project-rule" ),
  };
  return headers[operator];
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

const ProjectRuleRow = ( { group, projectId }: Props ) => {
  const { t } = useTranslation( );

  return (
    <View
      className="px-4 py-2.5"
      testID={`ProjectRuleRow.${projectId}.${group.operator}`}
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
