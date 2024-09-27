import { useNavigation, useRoute } from "@react-navigation/native";
// import { searchTaxa } from "api/taxa";
import fetchPlace from "api/places";
import {
  fetchProjectMembers,
  fetchProjects
} from "api/projects";
// import fetchSearchResults from "api/search";
import { Body2 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import User from "realmModels/User.ts";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import AboutProjectType from "./AboutProjectType";
import ProjectRuleItem from "./ProjectRuleItem";

const ProjectRequirements = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const { t } = useTranslation( );

  const qualityGradeOption = option => {
    switch ( option ) {
      case "research":
        return t( "quality-grade-research" );
      case "needs_id":
        return t( "quality-grade-needs-id" );
      default:
        return t( "quality-grade-casual" );
    }
  };

  const ruleOperands = {
    inclusions: [],
    exclusions: [],
    defaults: [t( "Any" )]
  };

  const RULES = [
    {
      ...ruleOperands,
      name: t( "Taxa" ),
      defaults: [t( "All-taxa" )]
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

  const queryKey = ["projectRequirements", "fetchProjects", id];

  // Project Requirements
  const { data: project } = useAuthenticatedQuery(
    queryKey,
    optsWithAuth => fetchProjects( id, {
      rule_details: true,
      fields: "all",
      ttl: -1
    }, optsWithAuth )
  );

  // const rules = project?.project_observation_rules;
  const placeId = Number( project?.place_id );

  // console.log( project, "project" );
  // console.log( project?.rule_preferences, "rule prefs" );

  const projectStartDate = project?.rule_preferences
    ?.filter( pref => pref.field === "d1" )?.[0]?.value;
  const projectEndDate = project?.rule_preferences
    ?.filter( pref => pref.field === "d2" )?.[0]?.value;

  if ( projectStartDate ) {
    const dateRule = RULES.find( r => r.name === t( "Date" ) );
    dateRule.inclusions = [
      // TODO: dates need internationalized formatting
      // from 2023-03-22 07:42 -06:00 to something readable
      // https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/shared/util.js#L4
      {
        text: `${projectStartDate} - ${projectEndDate}`
      }
    ];
  }

  const qualityGrades = project?.rule_preferences
    ?.filter( pref => pref.field === "quality_grade" )?.[0]?.value?.split( "," );

  if ( qualityGrades?.length > 0 ) {
    const qualityGradeRule = RULES.find( r => r.name === t( "Quality-Grade" ) );
    qualityGradeRule.inclusions = qualityGrades.map( grade => ( {
      text: qualityGradeOption( grade )
    } ) );
  }

  // note: this is duplicated in ProjectDetailsContainer, but since it's cached
  // by React Query it shouldn't make an extra API call here
  const { data: projectMembers } = useAuthenticatedQuery(
    ["fetchProjectMembers", id],
    optsWithAuth => fetchProjectMembers( {
      id,
      order_by: "login",
      fields: {
        user: User.LIMITED_FIELDS
      }
    }, optsWithAuth )
  );

  const users = projectMembers?.results?.map( members => members.user );

  if ( users ) {
    const userRule = RULES.find( r => r.name === t( "Users" ) );
    userRule.inclusions = users.map( u => ( {
      text: u.login,
      onPress: ( ) => navigation.navigate( "UserProfile", { userId: u.id } )
    } ) );
  }

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

  const { data: places } = useAuthenticatedQuery(
    ["fetchPlace", placeId],
    optsWithAuth => fetchPlace(
      placeId,
      {
        fields: {
          display_name: true
        }
      },
      optsWithAuth
    ),
    {
      enabled: !!( placeId )
    }
  );

  const placeResult = places?.results?.[0]?.display_name;

  if ( placeResult ) {
    const locationRule = RULES.find( r => r.name === t( "Location" ) );
    locationRule.inclusions = [( {
      text: placeResult,
      onPress: ( ) => navigation.navigate( "Explore", {
        place: {
          id: placeId,
          display_name: placeResult
        }
      } )
    } )];
  }

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
        <View key={rule.name}>
          <ProjectRuleItem rule={rule} />
          {renderItemSeparator( )}
        </View>
      ) )}
      <View className="mt-6">
        <AboutProjectType projectType="collection" />
      </View>
    </View>
  );
};

export default ProjectRequirements;
