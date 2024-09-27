import classnames from "classnames";
import { Body3, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import { useCurrentUser } from "sharedHooks";

interface Props {
  rule: Object
}

const ProjectRuleItem = ( { rule }: Props ) => {
  const currentUser = useCurrentUser( );

  const showTaxonName = taxon => (
    <DisplayTaxonName
      prefersCommonNames={currentUser?.prefers_common_names}
      removeStyling
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      small
      taxon={taxon}
    />
  );

  const showInclusions = ( ) => rule?.inclusions.map( inclusion => (
    <Body3
      key={inclusion?.text || inclusion?.taxon?.name}
      className={classnames(
        "pb-2 flex-row",
        {
          underline: inclusion?.onPress
        }
      )}
      onPress={inclusion?.onPress}
    >
      {inclusion?.text}
      {inclusion?.taxon && showTaxonName( inclusion?.taxon )}
    </Body3>
  ) );

  const showExclusions = ( ) => rule?.exclusions.map( exclusion => (
    <Body3
      key={exclusion?.text}
      className="flex-row pb-1"
      onPress={exclusion?.onPress}
    >
      {exclusion}
    </Body3>
  ) );

  const showDefaults = ( ) => rule?.defaults.map( projectDefault => (
    <Body3 className="flex-row pb-1" key={`${rule}-${projectDefault}`}>{projectDefault}</Body3>
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
    <View className="flex-row px-4">
      <Body3 className="w-1/3 pt-2">{rule.name}</Body3>
      <View className="pt-2 pb-1 w-2/3">
        {showRuleDetails( )}
      </View>
    </View>
  );
};

export default ProjectRuleItem;
