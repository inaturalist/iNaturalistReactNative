import { screen } from "@testing-library/react-native";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockProject = factory( "RemoteProject", {
  title: faker.lorem.sentence( ),
  icon: faker.image.url( ),
  header_image_url: faker.image.url( ),
  description: faker.lorem.paragraph( )
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockProject
  } )
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockProject.id
      }
    } )
  };
} );

describe( "ProjectDetails", ( ) => {
  test( "should not have accessibility errors", async ( ) => {
    renderComponent( <ProjectDetailsContainer /> );
    const projectDetails = await screen.findByTestId( "project-details" );
    expect( projectDetails ).toBeAccessible();
  } );

  test( "displays project details", ( ) => {
    renderComponent( <ProjectDetailsContainer /> );

    expect( screen.getByText( mockProject.title ) ).toBeTruthy( );
    expect( screen.getByText( mockProject.description ) ).toBeTruthy( );
    expect(
      screen.getByTestId( "ProjectDetails.headerImage" ).props.source
    ).toStrictEqual( { uri: mockProject.header_image_url } );
    expect(
      screen.getByTestId( "ProjectDetails.projectIcon" ).props.source
    ).toStrictEqual( { uri: mockProject.icon } );
  } );
} );
