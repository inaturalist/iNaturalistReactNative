import type { ApiProjectType } from "api/types";
import type { TFunction } from "i18next";

const displayProjectType = (
  projectType: ApiProjectType,
  t: TFunction,
) => {
  if ( projectType === "collection" ) {
    return t( "Collection-Project" );
  }
  if ( projectType === "umbrella" ) {
    return t( "Umbrella-Project" );
  }
  return t( "Traditional-Project" );
};

export default displayProjectType;
