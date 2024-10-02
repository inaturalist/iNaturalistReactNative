import { useNavigation, useRoute } from "@react-navigation/native";
import {
  fetchProjects
} from "api/projects";
import { ActivityIndicator, ProjectListItem, ScrollViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import AboutProjectType from "./AboutProjectType";
import ProjectRuleItem from "./ProjectRuleItem";

const getFieldValue = item => item?.[0]?.value;

// web reference at:
// https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/show/components/requirements.jsx
const ProjectRequirements = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const { t } = useTranslation( );

  const qualityGradeOption = option => {
    switch ( option ) {
      case "research":
        return t( "Research-Grade--quality-grade" );
      case "needs_id":
        return t( "Needs-ID--quality-grade" );
      default:
        return t( "Casual--quality-grade" );
    }
  };

  const ruleOperands = {
    inclusions: [],
    exclusions: [],
    defaults: [{
      text: t( "Any" )
    }]
  };

  const RULES = [
    {
      ...ruleOperands,
      name: t( "Taxa" ),
      defaults: [{
        text: t( "All-taxa" )
      }]
    },
    {
      ...ruleOperands,
      name: t( "Location" ),
      defaults: [{
        text: t( "Worldwide" )
      }]
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
  const { data: project, isLoading } = useAuthenticatedQuery(
    projectQueryKey,
    optsWithAuth => fetchProjects( id, {
      rule_details: true,
      fields: "all",
      ttl: -1
    }, optsWithAuth )
  );

  const filterRules = operator => project?.project_observation_rules
    .filter( r => r.operator === operator );

  const createTaxonObject = taxon => ( {
    taxon,
    text: null,
    onPress: ( ) => navigation.navigate( "TaxonDetails", {
      id: taxon.id
    } )
  } );

  const includedTaxonList = _.sortBy(
    filterRules( "in_taxon?" ),
    r => r.taxon.name
  );

  const excludedTaxonList = _.sortBy(
    filterRules( "not_in_taxon?" ),
    r => r.taxon.name
  );

  const taxonRule = RULES.find( r => r.name === t( "Taxa" ) );
  if ( includedTaxonList?.length > 0 ) {
    taxonRule.inclusions = includedTaxonList?.map( r => createTaxonObject( r.taxon ) );
  }
  if ( excludedTaxonList?.length > 0 ) {
    taxonRule.exclusions = excludedTaxonList?.map( r => createTaxonObject( r.taxon ) );
  }

  // Location Requirement
  const createPlaceObject = place => ( {
    text: place.display_name,
    onPress: ( ) => navigation.navigate( "Explore", {
      place: {
        id: place.id,
        display_name: place.display_name
      }
    } )
  } );

  const includedPlaces = _.sortBy( filterRules( "observed_in_place?" ), r => r.place.display_name );
  const excludedPlaces = _.sortBy(
    filterRules( "not_observed_in_place?" ),
    r => r.place.display_name
  );

  const locationRule = RULES.find( r => r.name === t( "Location" ) );
  if ( includedPlaces?.length > 0 ) {
    locationRule.inclusions = includedPlaces.map( ( { place } ) => createPlaceObject( place ) );
  }
  if ( excludedPlaces?.length > 0 ) {
    locationRule.exclusions = excludedPlaces.map( ( { place } ) => createPlaceObject( place ) );
  }

  // Users Requirements
  const membersOnly = getFieldValue( project?.search_parameters
    ?.filter( pref => pref.field === "members_only" ) );

  const includedUsers = _.sortBy( filterRules( "observed_by_user?" ), r => r.user.login );
  const excludedUsers = _.sortBy( filterRules( "not_observed_by_user?" ), r => r.user.login );
  const userRule = RULES.find( r => r.name === t( "Users" ) );

  const createUserObject = user => ( {
    text: user.login,
    onPress: ( ) => navigation.navigate( "UserProfile", { userId: user.id } )
  } );

  if ( includedUsers?.length > 0 ) {
    userRule.inclusions = includedUsers.map( r => createUserObject( r.user ) );
  }
  if ( excludedUsers?.length > 0 ) {
    userRule.exclusions = excludedUsers.map( r => createUserObject( r.user ) );
  }
  if ( membersOnly ) {
    userRule.defaults = [{
      text: t( "Project-Members-Only" )
    }];
  }

  // Projects Requirements
  const createProjectObject = includedProject => ( {
    text: includedProject.title,
    onPress: ( ) => navigation.navigate( "ProjectDetails", { id: includedProject.id } )
  } );
  const projectRule = RULES.find( r => r.name === t( "Projects" ) );
  const includedProjects = project?.project_observation_rules
    .filter( r => r.operand_type === "Project" );

  if ( includedProjects?.length > 0 ) {
    projectRule.inclusions = includedProjects.map( r => createProjectObject( r.project ) );
  }

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
  const sounds = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "sounds" ) );
  const photos = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "photos" ) );

  const mediaRule = RULES.find( r => r.name === t( "Media-Type" ) );
  const mediaList = [];
  if ( sounds ) {
    mediaList.push( { text: t( "Sounds" ) } );
  }
  if ( photos ) {
    mediaList.push( { text: t( "Photos" ) } );
  }
  if ( mediaList.length > 0 ) {
    mediaRule.inclusions = mediaList;
  }

  // Date Requirements
  const projectStartDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "d1" ) );
  const projectEndDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "d2" ) );
  const observedOnDate = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "observed_on" ) );
  const month = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "month" ) );

  // TODO: follow date formatting
  // https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/show/components/requirements.jsx#L100C3-L114C4
  const createDateObject = ( ) => {
    if ( projectStartDate && !projectEndDate ) {
      return t( "Start-time", { date: projectStartDate } );
    }
    if ( projectStartDate && projectEndDate ) {
      return `${projectStartDate} - ${projectEndDate}`;
    }
    if ( observedOnDate ) {
      return observedOnDate;
    }
    if ( month ) {
      return month;
    }
    return null;
  };

  const dateRule = RULES.find( r => r.name === t( "Date" ) );
  if ( createDateObject( ) !== null ) {
    dateRule.inclusions = [
    // TODO: dates need internationalized formatting
    // from 2023-03-22 07:42 -06:00 to something readable
    // https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/shared/util.js#L4
      {
        text: createDateObject( )
      }
    ];
  }

  // Establishment Requirements
  const introduced = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "introduced" ) );
  const native = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "native" ) );
  const endemic = getFieldValue( project?.rule_preferences
    ?.filter( pref => pref.field === "endemic" ) );

  const establishmentRule = RULES.find( r => r.name === t( "Establishment" ) );
  const establishmentList = [];
  if ( introduced ) {
    establishmentList.push( { text: t( "Introduced" ) } );
  }
  if ( native ) {
    establishmentList.push( { text: t( "Native" ) } );
  }
  if ( endemic ) {
    establishmentList.push( { text: t( "Endemic" ) } );
  }
  if ( establishmentList.length > 0 ) {
    establishmentRule.inclusions = establishmentList;
  }

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ScrollViewWrapper>
      {isLoading
        ? <ActivityIndicator size={50} />
        : (
          <>
            <View className="my-4 px-4">
              <ProjectListItem item={project} />
            </View>
            {renderItemSeparator( )}
            {RULES.map( rule => (
              <View key={rule.name}>
                <ProjectRuleItem rule={rule} />
                {renderItemSeparator( )}
              </View>
            ) )}
          </>
        )}
      <View className="mt-6 px-4">
        <AboutProjectType projectType="collection" />
      </View>
    </ScrollViewWrapper>
  );
};

export default ProjectRequirements;
