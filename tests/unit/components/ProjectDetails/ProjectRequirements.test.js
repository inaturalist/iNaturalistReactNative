import { screen } from "@testing-library/react-native";
import ProjectRequirements from "components/ProjectDetails/ProjectRequirements.tsx";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockProject = factory( "RemoteProject", {
  title: faker.lorem.sentence( ),
  icon: faker.image.url( ),
  header_image_url: faker.image.url( ),
  description: faker.lorem.paragraph( ),
  project_observation_rules: [],
  rule_preferences: [
    {
      field: "month",
      value: "1,5,8"
    }
  ]
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockProject
  } )
} ) );

beforeAll( async () => {
  jest.useFakeTimers( );
} );

describe( "ProjectRequirements", ( ) => {
  test( "displays project requirement months with correct formatting", async ( ) => {
    renderComponent( <ProjectRequirements /> );

    const months = await screen.findByText( /January, May, August/ );
    expect( months ).toBeTruthy( );
  } );
} );
