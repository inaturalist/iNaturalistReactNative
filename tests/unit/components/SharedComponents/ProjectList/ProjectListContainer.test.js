import { useRoute } from "@react-navigation/native";
import { render, screen } from "@testing-library/react-native";
import ProjectListContainer from "components/ProjectList/ProjectListContainer";
import React from "react";
import factory from "tests/factory";

const mockProjects = [
  factory( "RemoteProject", {
    title: "project_1",
  } ),
  factory( "RemoteProject", {
    title: "project_2",
  } ),
];

const mockObservationUuid = "00000000-0000-0000-0000-000000000001";

jest.mock( "sharedHooks/useRemoteObservation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    remoteObservation: {
      project_observations: mockProjects.map( project => ( { project } ) ),
      non_traditional_projects: [],
    },
    refetchRemoteObservation: jest.fn( ),
    isRefetching: false,
    fetchRemoteObservationError: null,
  } ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { data: null } ),
} ) );

describe( "ProjectListContainer", () => {
  beforeAll( ( ) => {
    useRoute.mockImplementation( ( ) => ( {
      params: {
        observationUuid: mockObservationUuid,
      },
    } ) );
  } );

  it( "should display a list with all project titles", async () => {
    render( <ProjectListContainer /> );
    const firstProjectTitle = await screen.findByText( mockProjects[0].title );
    expect( firstProjectTitle ).toBeVisible( );
    const secondProjectTitle = await screen.findByText( mockProjects[1].title );
    expect( secondProjectTitle ).toBeVisible( );
  } );
} );
