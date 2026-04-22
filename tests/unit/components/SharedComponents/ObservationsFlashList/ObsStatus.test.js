import {
  screen,
} from "@testing-library/react-native";
import ObsStatus from "components/SharedComponents/ObsStatus";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  identifications: [
    factory( "LocalIdentification", {
      current: true,
    } ),
    factory( "LocalIdentification", {
      current: false,
    } ),
  ],
  comments: [],
} );

describe( "ObsStatus", () => {
  it( "displays count for current ids, not withdrawn ids", () => {
    renderComponent(
      <ObsStatus
        observation={mockObservation}
      />,
    );

    const idCount = screen.getByText( /1/ );

    expect( idCount ).toBeVisible( );
  } );

  it( "displays comment count", () => {
    renderComponent(
      <ObsStatus
        observation={mockObservation}
      />,
    );

    const commentCount = screen.getByText( /0/ );

    expect( commentCount ).toBeVisible( );
  } );
} );
