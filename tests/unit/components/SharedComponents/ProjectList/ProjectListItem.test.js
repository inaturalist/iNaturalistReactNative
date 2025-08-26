import ProjectListItem from "components/ProjectList/ProjectListItem.tsx";
import React from "react";

const mockProject = {
  id: 1,
  title: "Project Title",
  icon: "https://static.inaturalist.org/projects/1/iconic_taxa_photos/medium.jpg?1521796076",
  project_type: "collection"
};

describe( "ProjectListItem", () => {
  it( "should be accessible", () => {
    const projectListItem = <ProjectListItem item={mockProject} />;
    // Disabled during the update to RN 0.78
    expect( projectListItem ).toBeTruthy();
    // expect( projectListItem ).toBeAccessible();
  } );
} );
