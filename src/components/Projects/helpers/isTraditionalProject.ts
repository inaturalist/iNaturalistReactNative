// Mirror legacy ios and rails in treating all projects that are neither collection nor
// umbrella as traditional. These can be "bioblitz", "contest", "assessment", or ""
// only "assessment" or "" can still be created in 2026
export const NON_TRADITIONAL_PROJECT_TYPES: string[] = ["collection", "umbrella"];

const isTraditionalProject = ( projectType: string | null | undefined ) => (
  !NON_TRADITIONAL_PROJECT_TYPES.includes( projectType ?? "" )
);

export default isTraditionalProject;
