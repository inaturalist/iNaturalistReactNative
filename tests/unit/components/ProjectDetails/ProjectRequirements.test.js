import { screen } from "@testing-library/react-native";
import ProjectRequirements from "components/ProjectDetails/ProjectRequirements";
import React from "react";
import { useAuthenticatedQuery } from "sharedHooks";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockProject = factory( "RemoteProject", {
  title: faker.lorem.sentence( ),
  icon: faker.image.url( ),
  header_image_url: faker.image.url( ),
  description: faker.lorem.paragraph( ),
  project_observation_rules: []
} );

const mockProjectWithMonths = factory( "RemoteProject", {
  ...mockProject,
  rule_preferences: [
    {
      field: "month",
      value: "1,5,8"
    }
  ]
} );

const mockProjectWithStartTime = factory( "RemoteProject", {
  ...mockProject,
  rule_preferences: [
    {
      field: "d1",
      value: "2024-02-01"
    }
  ]
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

const mockProjectWithObservedOnDate = factory( "RemoteProject", {
  ...mockProject,
  rule_preferences: [
    {
      field: "observed_on",
      value: "2022-08-24"
    }
  ]
} );

jest.mock(
  "sharedHooks/useAuthenticatedQuery",
  ( ) => ( {
    __esModule: true,
    default: jest.fn( ( ) => ( {
      data: null,
      isLoading: false,
      isError: false
    } ) )
  } )
);

beforeAll( () => {
  jest.useFakeTimers( );
} );

describe( "ProjectRequirements", ( ) => {
  test( "displays project rule months with correct formatting", async ( ) => {
    useAuthenticatedQuery.mockImplementation( ( ) => ( {
      data: mockProjectWithMonths
    } ) );
    renderComponent( <ProjectRequirements /> );

    const months = await screen.findByText( /January, May, August/ );
    expect( months ).toBeTruthy( );
  } );

  test( "displays project rule start time with correct formatting", async ( ) => {
    useAuthenticatedQuery.mockImplementation( ( ) => ( {
      data: mockProjectWithStartTime
    } ) );
    renderComponent( <ProjectRequirements /> );

    const startTime = await screen.findByText( "Start time: Feb 1, 2024" );
    expect( startTime ).toBeTruthy( );
  } );

  test( "displays project rule date range with correct formatting", async ( ) => {
    useAuthenticatedQuery.mockImplementation( ( ) => ( {
      data: mockProjectWithDateRange
    } ) );
    renderComponent( <ProjectRequirements /> );

    const dateRange = await screen.findByText( "Mar 7, 2024 - Mar 14, 2024" );
    expect( dateRange ).toBeTruthy( );
  } );

  test( "displays project rule observed on date with correct formatting", async ( ) => {
    useAuthenticatedQuery.mockImplementation( ( ) => ( {
      data: mockProjectWithObservedOnDate
    } ) );
    renderComponent( <ProjectRequirements /> );

    const observedOnDate = await screen.findByText( "Aug 24, 2022" );
    expect( observedOnDate ).toBeTruthy( );
  } );
} );
