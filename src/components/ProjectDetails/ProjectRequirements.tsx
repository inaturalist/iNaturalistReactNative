import { useNavigation, useRoute } from "@react-navigation/native";
import fetchPlace from "api/places";
import {
  fetchProjectMembers,
  fetchProjects
} from "api/projects";
import { fetchTaxon } from "api/taxa";
import { Body2, ScrollViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import Taxon from "realmModels/Taxon";
import User from "realmModels/User.ts";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import AboutProjectType from "./AboutProjectType";
import ProjectRuleItem from "./ProjectRuleItem";

const getFieldValue = item => item?.[0]?.value;

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
      name: t( "Quality-Grade" )
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

  const projectQueryKey = ["projectRequirements", "fetchProjects", id];

  // Overall Project Requirements
  const { data: project } = useAuthenticatedQuery(
    projectQueryKey,
    optsWithAuth => fetchProjects( id, {
      rule_details: true,
      fields: "all",
      ttl: -1
    }, optsWithAuth )
  );

  // const rules = project?.project_observation_rules;

  console.log( project?.search_parameters, "search params" );
  // console.log( project?.rule_preferences, "rule prefs" );

  // Taxa Requirements
  const includedTaxonIds = getFieldValue( project?.search_parameters
    ?.filter( pref => pref.field === "taxon_id" ) );

  const excludedTaxonIds = getFieldValue( project?.search_parameters
    ?.filter( pref => pref.field === "without_taxon_id" ) );

  // console.log( taxonIds, "taxon ids" );
  // const includedTaxonIds = rules?.filter( rule => rule.operand_type === "Taxon"
  //   && rule.operator === "in_taxon?" ).map( rule => rule.operand_id );

  // console.log( taxonIds, "taxon ids" );
  // console.log( includedTaxonIds, "included" );

  // TODO: deal with exceptions
  // TODO: deal with queries with too many taxon Ids
  const includedTaxaQueryKey = ["includedProjectTaxa", "fetchTaxon", includedTaxonIds];

  const {
    data: taxaNames
  } = useAuthenticatedQuery(
    includedTaxaQueryKey,
    optsWithAuth => fetchTaxon( includedTaxonIds, {
      fields: Taxon.LIMITED_TAXON_FIELDS
    }, optsWithAuth ),
    {
      enabled: includedTaxonIds?.length > 0
    }
  );

  const excludedTaxaQueryKey = ["excludedProjectTaxa", "fetchTaxon", excludedTaxonIds];

  const {
    data: excludedTaxaNames
  } = useAuthenticatedQuery(
    excludedTaxaQueryKey,
    optsWithAuth => fetchTaxon( excludedTaxonIds, {
      fields: Taxon.LIMITED_TAXON_FIELDS
    }, optsWithAuth ),
    {
      enabled: excludedTaxonIds?.length > 0
    }
  );

  const createTaxonObject = taxon => ( {
    taxon,
    text: null,
    onPress: ( ) => navigation.navigate( "TaxonDetails", {
      id: taxon.id
    } )
  } );

  const taxonRule = RULES.find( r => r.name === t( "Taxa" ) );
  if ( taxaNames?.results?.length > 0 ) {
    const sortedResults = _.sortBy( taxaNames?.results, taxon => taxon.name );
    taxonRule.inclusions = sortedResults?.map( taxon => createTaxonObject( taxon ) );
  }

  if ( excludedTaxaNames?.results?.length > 0 ) {
    const sortedResults = _.sortBy( excludedTaxaNames?.results, taxon => taxon.name );
    taxonRule.exclusions = sortedResults?.map( taxon => createTaxonObject( taxon ) );
  }

  // Location Requirement
  const placeId = Number( project?.place_id );

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

  // Users Requirements
  const userIds = getFieldValue( project?.search_parameters
    ?.filter( pref => pref.field === "user_id" ) );
  const membersOnly = getFieldValue( project?.search_parameters
    ?.filter( pref => pref.field === "members_only" ) );

  const projectUsersQueryKey = ["projectRequirements", "fetchProjectMembers", id];
  const { data: projectMembers } = useAuthenticatedQuery(
    projectUsersQueryKey,
    optsWithAuth => fetchProjectMembers( {
      id,
      order_by: "login",
      per_page: 100,
      fields: {
        user: User.LIMITED_FIELDS
      }
    }, optsWithAuth ),
    {
      enabled: !membersOnly && userIds?.length > 0
    }
  );

  const users = projectMembers?.results?.map( members => members.user );
  const userRule = RULES.find( r => r.name === t( "Users" ) );

  if ( users?.length > 0 ) {
    userRule.inclusions = users
      .filter( user => userIds?.includes( user.id ) )
      .map( u => ( {
        text: u.login,
        onPress: ( ) => navigation.navigate( "UserProfile", { userId: u.id } )
      } ) );
  } else if ( membersOnly ) {
    userRule.defaults = [t( "Project-Members-Only" )];
  }

  // Projects Requirements

  // Quality Grade Requirements
  const qualityGrades = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "quality_grade" ) )?.split( "," );

  if ( qualityGrades?.length > 0 ) {
    const qualityGradeRule = RULES.find( r => r.name === t( "Quality-Grade" ) );
    qualityGradeRule.inclusions = qualityGrades.map( grade => ( {
      text: qualityGradeOption( grade )
    } ) );
  }

  // Media Type Requirements

  // Date Requirements
  const projectStartDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "d1" ) );
  const projectEndDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "d2" ) );

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

  // Establishment Requirements

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ScrollViewWrapper>
      <Body2 className="mb-4 px-4">
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
    </ScrollViewWrapper>
  );
};

export default ProjectRequirements;
