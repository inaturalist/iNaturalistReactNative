import { useRoute } from "@react-navigation/native";
import {
  fetchProjects
} from "api/projects";
// import { searchTaxa } from "api/taxa";
import { Body2 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import AboutProjectType from "./AboutProjectType";
import ProjectRuleItem from "./ProjectRuleItem";

const ProjectRequirements = ( ) => {
  const { params } = useRoute( );
  const { id } = params;
  const { t } = useTranslation( );

  const ruleOperands = {
    inclusions: [],
    exclusions: [],
    defaults: [t( "Any" )]
  };

  const RULES = [
    {
      ...ruleOperands,
      name: t( "Taxa" )
    },
    {
      ...ruleOperands,
      name: t( "Location" ),
      defaults: [t( "Worldwide" )]
    },
    {
      ...ruleOperands,
      name: t( "Users" )
    },
    {
      ...ruleOperands,
      name: t( "Projects" )
    },
    {
      ...ruleOperands,
      name: t( "Quality-Grade" ),
      defaults: [t( "Research-Grade" ), t( "Needs-ID" )]
    },
    {
      ...ruleOperands,
      name: t( "Media-Type" )
    },
    {
      ...ruleOperands,
      name: t( "Date" )
    },
    {
      ...ruleOperands,
      name: t( "Establishment" )
    }
  ];

  const { data: project } = useAuthenticatedQuery(
    ["fetchProjects", id],
    optsWithAuth => fetchProjects( id, {
      fields: {
        project_observation_rules: {
          id: true,
          operand_id: true,
          operand_type: true,
          operator: true
        }
      }
    }, optsWithAuth )
  );

  const rules = project?.project_observation_rules;

  // const taxonIds = rules?.filter( rule => rule.operand_type === "Taxon" )
  //   // && rule.operator === "in_taxon?" )
  //   .map( rule => rule.id );

  // console.log( taxonIds, "taxon ids" );

  // const {
  //   data: taxaNames
  // } = useAuthenticatedQuery(
  //   ["fetchTaxon", taxonIds],
  //   optsWithAuth => searchTaxa( taxonIds, {
  //     fields: {
  //       name: true,
  //       preferred_common_name: true
  //     }
  //   }, optsWithAuth ),
  //   {
  //     enabled: taxonIds?.length > 0
  //   }
  // );

  // if ( taxaNames.length > 0 ) {
  //   RULES.taxon = {
  //     included: rules?.filter( rule => rule.operand_type === "Taxon"
  //       && rule.operator === "in_taxon?" )
  //       .map( rule => rule.id )
  //     };
  //   }
  // }

  console.log( rules?.map( rule => rule.operand_type ), "rule types" );

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <View className="bg-white flex-1 p-5">
      <Body2 className="mb-4">
        {t( "Observations-in-this-project-must-meet-the-following-criteria" )}
      </Body2>
      {renderItemSeparator( )}
      {RULES.map( rule => (
        <>
          <ProjectRuleItem rule={rule} />
          {renderItemSeparator( )}
        </>
      ) )}
      <View className="mt-6">
        <AboutProjectType projectType="collection" />
      </View>
    </View>
  );
};

export default ProjectRequirements;
