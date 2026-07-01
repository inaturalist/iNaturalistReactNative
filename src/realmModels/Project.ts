import { Realm } from "@realm/react";
import type { ApiProjectSummaryWithPOF } from "api/types";
import { UpdateMode } from "realm";
import ProjectObservationField from "realmModels/ProjectObservationField";
import type { RealmProject } from "realmModels/types";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

class Project extends Realm.Object {
  static mapApiToRealm( apiProject: ApiProjectSummaryWithPOF ) {
    if ( !apiProject ) return apiProject;

    const pofs = ( apiProject.project_observation_fields || [] ).map(
      pof => ProjectObservationField.mapApiToRealm( pof ),
    );

    const localProject = {
      ...apiProject,
      projectObservationFields: pofs,
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
    return {
      icon: realmProject.icon,
      id: realmProject.id,
      projectObservationFields: realmProject.projectObservationFields.length > 0
        ? realmProject.projectObservationFields
          .map( pof => ProjectObservationField.mapRealmToPojo( pof ) )
        : [],
      project_type: realmProject.project_type,
      // We only persist traditional projects which do not have rule_preferences
      rule_preferences: [],
      title: realmProject.title,
    };
  }

  static schema = {
    name: "Project",
    primaryKey: "id",
    properties: {
      icon: "string?",
      id: "int",
      projectObservationFields: "ProjectObservationField[]",
      project_type: "string?",
      title: "string?",
    },
  };
}

export default Project;
