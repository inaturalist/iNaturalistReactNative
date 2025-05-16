import { screen } from "@testing-library/react-native";
import ObsEditHeader from "components/ObsEdit/ObsEditHeader";
import React from "react";
import { View } from "react-native";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent, wrapInNavigationContainer } from "tests/helpers/render";

// eslint-disable-next-line i18next/no-literal-string
const mockHeaderBackButton = <View testID="ObsEdit.BackButton">Mocked Back</View>;

// Note: HeaderBackButton has accessibility issues
jest.mock( "@react-navigation/elements", () => ( {
  ...jest.requireActual( "@react-navigation/elements" ),
  HeaderBackButton: jest.fn()
    .mockImplementation( ( ) => mockHeaderBackButton )
} ) );

const mockObservations = [
  factory( "LocalObservation" ),
  factory( "LocalObservation" )
];

describe( "ObsEditHeader", () => {
  it( "has no accessibility errors", () => {
    const button = wrapInNavigationContainer(
      <ObsEditHeader
        observations={mockObservations}
      />
    );

    expect( button ).toBeAccessible();
  } );

  it( "renders a header title with 1 observation", async () => {
    renderComponent(
      <ObsEditHeader
        observations={[mockObservations[1]]}
      />
    );

    const headerText = await screen.findByText( /New Observation/ );

    expect( headerText ).toBeVisible();
  } );

  it( "renders a header title with multiple observations", async () => {
    renderComponent(
      <ObsEditHeader
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
      <ObsEditHeader
        currentObservation={observation}
        observations={[observation]}
      />
    );

    const headerText = await screen.findByText( /Edit Observation/ );

    expect( headerText ).toBeVisible();
  } );

  it( "renders a kebab menu", async () => {
    renderComponent(
      <ObsEditHeader
        observations={mockObservations}
      />
    );

    const kebabLabel = await screen.findByLabelText( /Menu/ );

    expect( kebabLabel ).toBeVisible();
  } );

  it( "renders a back button", () => {
    renderComponent(
      <ObsEditHeader
        observations={mockObservations}
      />
    );

    const backButtonId = screen.getByTestId( "ObsEdit.BackButton" );

    expect( backButtonId ).toBeVisible( );
  } );
} );
