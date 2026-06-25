import { Realm } from "@realm/react";
import type { ApiProjectSummaryWithPOF } from "api/types";
import ProjectObservationField from "realmModels/ProjectObservationField";

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
