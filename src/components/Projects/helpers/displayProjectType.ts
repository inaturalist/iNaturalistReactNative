const displayProjectType = (
  projectType: "collection" | "umbrella" | "",
  t: ( _: string ) => string,
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
