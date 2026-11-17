import { screen } from "@testing-library/react-native";
import MoreSection from "components/ObsDetailsDefaultMode/MoreSection/MoreSection";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  latitude: Number( faker.location.latitude( ) ),
  longitude: Number( faker.location.longitude( ) ),
  description: faker.lorem.paragraph( ),
  quality_grade: "casual",
} );

const mockObservationWithProjects = {
  ...mockObservation,
  non_traditional_projects: [
    {
      project: factory( "RemoteProject" ),
    }, {
      project: factory( "RemoteProject" ),
    },
  ],
  project_observations: [
    {
      project: factory( "RemoteProject" ),
    },
  ],
};

describe( "MoreSection", ( ) => {
  test( "should not display projects button if observation belongs to zero projects", ( ) => {
    renderComponent( <MoreSection observation={mockObservation} /> );
    const viewProjectsButton = screen.queryByText( /Projects/ );
    expect( viewProjectsButton ).toBeFalsy( );
  } );

  test( "should display projects button if observation belongs to 1+ projects", ( ) => {
    renderComponent( <MoreSection observation={mockObservationWithProjects} /> );
    const viewProjectsButton = screen.queryByText( /Projects/ );
    expect( viewProjectsButton ).toBeTruthy( );
  } );
} );
