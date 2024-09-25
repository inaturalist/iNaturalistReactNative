import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";

interface Props {
  rule: Object
}

const ProjectRuleItem = ( { rule }: Props ) => {
  const showInclusions = ( ) => rule?.inclusions.map( inclusion => (
    <Body3 className="flex-row pb-1">{inclusion}</Body3>
  ) );

  const showExclusions = ( ) => rule?.exclusions.map( exclusion => (
    <Body3 className="flex-row pb-1">{exclusion}</Body3>
  ) );

  const showDefaults = ( ) => rule?.defaults.map( projectDefault => (
    <Body3 className="flex-row pb-1">{projectDefault}</Body3>
  ) );

  const showRuleDetails = ( ) => {
    if ( !_.isEmpty( rule?.inclusions ) ) {
      return showInclusions( );
    }
    if ( !_.isEmpty( rule?.exclusions ) ) {
      return showExclusions( );
    }
    return showDefaults( );
  };

  return (
    <View className="flex-row">
      <Body3 className="w-1/3 pt-2">{rule.name}</Body3>
      <View className="pt-2 pb-1">
        {showRuleDetails( )}
      </View>
    </View>
  );
};

export default ProjectRuleItem;
