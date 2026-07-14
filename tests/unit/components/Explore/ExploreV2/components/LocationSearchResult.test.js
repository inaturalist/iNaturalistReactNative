import { fireEvent, screen } from "@testing-library/react-native";
import LocationSearchResult
  from "components/Explore/ExploreV2/components/LocationSearchResult";
import initI18next from "i18n/initI18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const PLACE_WITH_TYPE = {
  type: "place",
  id: 1,
  display_name: "Monterey, CA, US",
  place_type: 9,
};

const PLACE_WITHOUT_TYPE = {
  type: "place",
  id: 2,
  display_name: "Somewhere",
  place_type: null,
};

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "LocationSearchResult", ( ) => {
  it( "renders a place with its display name and human-readable place type", ( ) => {
    renderComponent(
      <LocationSearchResult place={PLACE_WITH_TYPE} onPress={jest.fn( )} />,
    );

    expect( screen.getByTestId( "LocationSearchResult.1" ) ).toBeTruthy( );
    expect( screen.getByText( "Monterey, CA, US" ) ).toBeTruthy( );
    expect( screen.getByText( "County" ) ).toBeTruthy( );
  } );

  it( "omits the place type row when place_type is missing", ( ) => {
    renderComponent(
      <LocationSearchResult place={PLACE_WITHOUT_TYPE} onPress={jest.fn( )} />,
    );

    expect( screen.getByTestId( "LocationSearchResult.2" ) ).toBeTruthy( );
    expect( screen.getByText( "Somewhere" ) ).toBeTruthy( );
    expect( screen.queryByText( "County" ) ).toBeNull( );
  } );

  it( "calls onPress when the row is tapped", ( ) => {
    const onPress = jest.fn( );
    renderComponent(
      <LocationSearchResult place={PLACE_WITH_TYPE} onPress={onPress} />,
    );

    fireEvent.press( screen.getByTestId( "LocationSearchResult.1" ) );

    expect( onPress ).toHaveBeenCalledTimes( 1 );
  } );
} );
