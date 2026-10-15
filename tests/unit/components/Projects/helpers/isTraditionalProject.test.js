import isTraditionalProject from "components/Projects/helpers/isTraditionalProject";

describe( "isTraditionalProject", ( ) => {
  it.each( ["", "assessment", "bioblitz", "contest"] )(
    "treats %p as traditional",
    projectType => {
      expect( isTraditionalProject( projectType ) ).toBe( true );
    },
  );

  it.each( ["collection", "umbrella"] )(
    "treats %p as not traditional",
    projectType => {
      expect( isTraditionalProject( projectType ) ).toBe( false );
    },
  );
} );
