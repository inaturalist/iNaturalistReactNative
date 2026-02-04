import { useNavigation, useRoute } from "@react-navigation/native";
import {
  fetchProjects,
} from "api/projects";
import ProjectListItem from "components/ProjectList/ProjectListItem";
import { ActivityIndicator, ScrollViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import sortBy from "lodash/sortBy";
import React from "react";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import formatProjectDate from "../Projects/helpers/displayDates";
import AboutProjectType from "./AboutProjectType";
import ProjectRuleItem from "./ProjectRuleItem";

const getFieldValue = item => item?.[0]?.value;

// web reference at:
// https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/show/components/requirements.jsx
const ProjectRequirements = ( ) => {
  const navigation = useNavigation( );
  const route = useRoute( );
  const { params } = route;
  const { id } = params;
  const { t, i18n } = useTranslation( );

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
    defaults: [],
  };

  const RULES = [
    {
      ...ruleOperands,
      name: t( "Taxa" ),
      defaults: [{
        text: t( "All-taxa" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Location" ),
      defaults: [{
        text: t( "Worldwide" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Users" ),
      defaults: [{
        text: t( "Any--user" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Projects" ),
      defaults: [{
        text: t( "Any--project" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Quality-Grade" ),
      defaults: [{
        text: t( "Any--quality-grade" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Media-Type" ),
      defaults: [{
        text: t( "Any--media-type" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Date" ),
      defaults: [{
        text: t( "Any--date" ),
      }],
    },
    {
      ...ruleOperands,
      name: t( "Establishment" ),
      defaults: [{
        text: t( "Any--establishment-means" ),
      }],
    },
  ];

  const projectQueryKey = ["projectRequirements", "fetchProjects", id];

  // Overall Project Requirements
  const { data: project, isLoading } = useAuthenticatedQuery(
    projectQueryKey,
    optsWithAuth => fetchProjects( id, {
      rule_details: true,
      fields: "all",
      ttl: -1,
    }, optsWithAuth ),
  );

  const filterRules = operator => project?.project_observation_rules
    .filter( r => r.operator === operator );

  const createTaxonObject = taxon => ( {
    taxon,
    text: null,
    // onPress: ( ) => navigation.navigate( "TaxonDetails", {
    //   id: taxon.id
    // } )
    onPress: ( ) => (
      navigation.navigate( {
        // Ensure button mashing doesn't open multiple TaxonDetails instances
        key: `${route.key}-ProjectRequirements-TaxonDetails-${taxon.id}`,
        name: "TaxonDetails",
        params: { id: taxon.id },
      } )
    ),
  } );

  const includedTaxonList = sortBy(
    filterRules( "in_taxon?" ),
    r => r.taxon.name,
  );

  const excludedTaxonList = sortBy(
    filterRules( "not_in_taxon?" ),
    r => r.taxon.name,
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
        display_name: place.display_name,
      },
    } ),
  } );

  const includedPlaces = sortBy( filterRules( "observed_in_place?" ), r => r.place.display_name );
  const excludedPlaces = sortBy(
    filterRules( "not_observed_in_place?" ),
    r => r.place.display_name,
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

  const includedUsers = sortBy( filterRules( "observed_by_user?" ), r => r.user.login );
  const excludedUsers = sortBy( filterRules( "not_observed_by_user?" ), r => r.user.login );
  const userRule = RULES.find( r => r.name === t( "Users" ) );

  const createUserObject = user => ( {
    text: user.login,
    onPress: ( ) => navigation.navigate( "UserProfile", { userId: user.id } ),
  } );

  if ( includedUsers?.length > 0 ) {
    userRule.inclusions = includedUsers.map( r => createUserObject( r.user ) );
  }
  if ( excludedUsers?.length > 0 ) {
    userRule.exclusions = excludedUsers.map( r => createUserObject( r.user ) );
  }
  if ( membersOnly ) {
    userRule.defaults = [{
      text: t( "Project-Members-Only" ),
    }];
  }

  // Projects Requirements
  const createProjectObject = includedProject => ( {
    text: includedProject.title,
    onPress: ( ) => navigation.navigate( "ProjectDetails", { id: includedProject.id } ),
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
      text: qualityGradeOption( grade ),
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

  const dateRule = RULES.find( r => r.name === t( "Date" ) );
  const { projectDate } = formatProjectDate( project, t, i18n );
  if ( projectDate !== null ) {
    dateRule.inclusions = [
    // TODO: dates need internationalized formatting
    // from 2023-03-22 07:42 -06:00 to something readable
    // https://github.com/inaturalist/inaturalist/blob/0994c85e2b87661042289ff080d3fc29ed8e70b3/app/webpack/projects/shared/util.js#L4
      {
        text: projectDate,
      },
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
              <ProjectListItem item={project} isHeader />
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
      <View className="pt-2 pb-8 px-4">
        <AboutProjectType projectType="collection" />
      </View>
    </ScrollViewWrapper>
  );
};

export default ProjectRequirements;
