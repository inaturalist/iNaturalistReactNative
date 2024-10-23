import { useRoute } from "@react-navigation/native";
import { render, screen } from "@testing-library/react-native";
import { ProjectList } from "components/SharedComponents";
import React from "react";
import factory from "tests/factory";

const mockProjects = [
  factory( "RemoteProject", {
    title: "project_1"
  } ),
  factory( "RemoteProject", {
    title: "project_2"
  } )
];

describe( "ProjectList", () => {
  beforeAll( ( ) => {
    useRoute.mockImplementation( ( ) => ( {
      params: {
        projects: mockProjects
      }
    } ) );
  } );

  it( "should display a list with all project titles", async () => {
    render( <ProjectList /> );
    const firstProjectTitle = await screen.findByText( mockProjects[0].title );
    expect( firstProjectTitle ).toBeVisible( );
    const secondProjectTitle = await screen.findByText( mockProjects[1].title );
    expect( secondProjectTitle ).toBeVisible( );
  } );
} );
