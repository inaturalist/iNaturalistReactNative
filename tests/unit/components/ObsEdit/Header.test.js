import { screen } from "@testing-library/react-native";
import Header from "components/ObsEdit/Header";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservations = [
  factory( "LocalObservation" ),
  factory( "LocalObservation" )
];

describe( "Header", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "has no accessibility errors", () => {
    const button = (
      <Header
        observations={mockObservations}
      />
    );

    expect( button ).toBeAccessible();
  } );

  it( "renders a header title with 1 observation", async () => {
    renderComponent(
      <Header
        observations={[mockObservations[1]]}
      />
    );

    const headerText = await screen.findByText( /New Observation/ );

    expect( headerText ).toBeVisible();
  } );

  it( "renders a header title with multiple observations", async () => {
    renderComponent(
      <Header
        observations={mockObservations}
      />
    );

    const headerText = await screen.findByText( /2 Observations/ );

    expect( headerText ).toBeVisible();
  } );

  it( "renders edit header title when observation is saved locally", async () => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( )
    } );
    renderComponent(
      <Header
        currentObservation={observation}
        observations={[observation]}
      />
    );

    const headerText = await screen.findByText( /Edit Observation/ );

    expect( headerText ).toBeVisible();
  } );

  it( "renders a kebab menu", async () => {
    renderComponent(
      <Header
        observations={mockObservations}
      />
    );

    const kebabLabel = await screen.findByLabelText( /Menu/ );

    expect( kebabLabel ).toBeVisible();
  } );

  it( "renders a back button with extra padding for accessibility", () => {
    renderComponent(
      <Header
        observations={mockObservations}
      />
    );

    const backButtonId = screen.getByTestId( "ObsEdit.BackButton" );

    expect( backButtonId ).toBeVisible();
    expect(
      backButtonId
    ).toHaveStyle( { paddingVertical: 18, paddingEnd: 24 } );
  } );
} );
