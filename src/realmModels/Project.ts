import { Realm } from "@realm/react";
import type { ApiProjectSummaryWithPOF, ProjectSearchParameter } from "api/types";
import { UpdateMode } from "realm";
import ProjectObservationField from "realmModels/ProjectObservationField";
import ProjectObservationRule from "realmModels/ProjectObservationRule";
import ProjectRulePreference from "realmModels/ProjectRulePreference";
import type { RealmProject } from "realmModels/types";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

// Bioblitz date windows aren't exposed as start_time/end_time, only as the
// d1/d2 search parameters, either dates or datetimes with a UTC offset
const bioblitzBound = (
  searchParameters: ProjectSearchParameter[] | undefined,
  field: "d1" | "d2",
) => {
  const value = searchParameters?.find( param => param.field === field )?.value;
  return typeof value === "string"
    ? value
    : undefined;
};

class Project extends Realm.Object {
  static mapApiToRealm( apiProject: ApiProjectSummaryWithPOF ) {
    if ( !apiProject ) return apiProject;

    const pofs = ( apiProject.project_observation_fields || [] ).map(
      pof => ProjectObservationField.mapApiToRealm( pof ),
    );

    const isBioblitz = apiProject.project_type === "bioblitz";
    const localProject = {
      ...apiProject,
      bioblitz_d1: isBioblitz
        ? bioblitzBound( apiProject.search_parameters, "d1" )
        : undefined,
      bioblitz_d2: isBioblitz
        ? bioblitzBound( apiProject.search_parameters, "d2" )
        : undefined,
      projectObservationFields: pofs,
      project_observation_rules: ( apiProject.project_observation_rules || [] ).map(
        rule => ProjectObservationRule.mapApiToRealm( rule ),
      ),
      rule_preferences: ( apiProject.rule_preferences || [] ).map(
        pref => ProjectRulePreference.mapApiToRealm( pref ),
      ),
      // Leaving this here explicitly as a reminder to potentially need to refactor project_type
      // into projectType across the entire codebase for consistency with other data models
      project_type: apiProject.project_type,
    };

    return localProject;
  }

  static upsertRemoteProjects( apiProjects: ApiProjectSummaryWithPOF[], realm: Realm ) {
    if ( !apiProjects || apiProjects.length === 0 ) return;

    safeRealmWrite( realm, ( ) => {
      apiProjects.forEach( apiProject => {
        const projectMappedForRealm = Project.mapApiToRealm( apiProject );
        realm.create(
          "Project",
          projectMappedForRealm,
          UpdateMode.Modified,
        );
      } );
    }, "upserting projects in Project" );
  }

  static mapRealmToPojo( realmProject: RealmProject ) {
    const pojoPOFs = realmProject.projectObservationFields
      .map( pof => ProjectObservationField.mapRealmToPojo( pof ) );
    return {
      bioblitz_d1: realmProject.bioblitz_d1,
      bioblitz_d2: realmProject.bioblitz_d2,
      icon: realmProject.icon,
      id: realmProject.id,
      projectObservationFields: pojoPOFs.length > 0
        ? pojoPOFs
          // Add to projects screen should display them in this order
          .sort( ( a, b ) => a.position - b.position )
        : [],
      project_observation_rules: realmProject.project_observation_rules
        .map( rule => ProjectObservationRule.mapRealmToPojo( rule ) ),
      project_type: realmProject.project_type,
      rule_preferences: realmProject.rule_preferences
        .map( pref => ProjectRulePreference.mapRealmToPojo( pref ) ),
      title: realmProject.title,
    };
  }

  static schema = {
    name: "Project",
    primaryKey: "id",
    properties: {
      bioblitz_d1: "string?",
      bioblitz_d2: "string?",
      icon: "string?",
      id: "int",
      projectObservationFields: "ProjectObservationField[]",
      project_observation_rules: "ProjectObservationRule[]",
      project_type: "string?",
      rule_preferences: "ProjectRulePreference[]",
      title: "string?",
    },
  };
}

export default Project;
