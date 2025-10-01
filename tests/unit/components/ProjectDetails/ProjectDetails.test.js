import { screen } from "@testing-library/react-native";
import ProjectDetails from "components/ProjectDetails/ProjectDetails";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import {
  renderComponent
} from "tests/helpers/render";

const mockProject = factory( "RemoteProject", {
  title: faker.lorem.sentence( ),
  icon: faker.image.url( ),
  header_image_url: faker.image.url( ),
  description: faker.lorem.paragraph( ),
  project_type: "collection"
} );

const mockProjectWithDateRange = factory( "RemoteProject", {
  ...mockProject,

  rule_preferences: [
    {
      field: "d1",
      value: "2024-03-07 07:42 -06:00"
    },
    {
      field: "d2",
      value: "2024-03-14 08:41 -07:00"
    }
  ]
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockProject
  } )
} ) );

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
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
    } ),
    useNavigation: jest.fn( )
  };
} );

beforeAll( async () => {
  jest.useFakeTimers( );
} );

// Disabled during the update to RN 0.78
describe( "ProjectDetails", ( ) => {
  // test( "should not have accessibility errors", async ( ) => {
  //   const view = wrapInQueryClientContainer(
  //     <ProjectDetailsContainer />
  //   );
  //   expect( view ).toBeTruthy();
  //   expect( view ).toBeAccessible();
  // } );

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

  it( "renders when project has no description", ( ) => {
    renderComponent(
      <ProjectDetails
        project={{
          ...mockProject,
          description: null
        }}
      />
    );
    expect( screen.getByText( mockProject.title ) ).toBeTruthy( );
  } );

  test( "should display date range if collection project has date range", async ( ) => {
    renderComponent( <ProjectDetails
      project={mockProjectWithDateRange}
    /> );
    const dateRange = await screen.findByText( "Mar 7, 2024 - Mar 14, 2024" );
    expect( dateRange ).toBeTruthy( );
  } );

  test( "should display date range if collection project has no date range", async ( ) => {
    renderComponent( <ProjectDetails
      project={mockProject}
    /> );
    const projectTypeText = await screen.findByText( /Collection Project/ );
    expect( projectTypeText ).toBeTruthy( );
  } );

  test( "should display project type if project is traditional project", async ( ) => {
    renderComponent( <ProjectDetails
      project={{
        ...mockProjectWithDateRange,
        project_type: "traditional"
      }}
    /> );
    const projectTypeText = await screen.findByText( /Traditional Project/ );
    expect( projectTypeText ).toBeTruthy( );
  } );

  test( "should display date range if umbrella project has date range", async ( ) => {
    renderComponent( <ProjectDetails
      project={{
        ...mockProjectWithDateRange,
        project_type: "umbrella"
      }}
    /> );
    const dateRange = await screen.findByText( "Mar 7, 2024 - Mar 14, 2024" );
    expect( dateRange ).toBeTruthy( );
  } );
} );
