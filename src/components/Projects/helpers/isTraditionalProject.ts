// Mirrors the server's Project#is_new_project?: every other project_type,
// including "", null, and the "assessment", "bioblitz", and "contest" types
// the web still creates or keeps, is a traditional project
export const NON_TRADITIONAL_PROJECT_TYPES: string[] = ["collection", "umbrella"];

const isTraditionalProject = ( projectType: string | null | undefined ) => (
  !NON_TRADITIONAL_PROJECT_TYPES.includes( projectType ?? "" )
);

export default isTraditionalProject;
