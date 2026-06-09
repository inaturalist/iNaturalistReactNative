import { fireEvent, screen } from "@testing-library/react-native";
import UniversalSearch from "components/Explore/ExploreV2/screens/UniversalSearch";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      goBack: jest.fn( ),
      canGoBack: ( ) => true,
    } ),
  };
} );

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "UniversalSearch screen", ( ) => {
  it( "renders the core layout", ( ) => {
    renderComponent( <UniversalSearch /> );

    expect( screen.getByTestId( "UniversalSearch" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.taxonInput" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.locationInput" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.searchButton" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearch.back" ) ).toBeTruthy( );
  } );

  it( "updates the controlled inputs as the user types", ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.changeText( screen.getByTestId( "UniversalSearch.taxonInput" ), "cup plant" );
    fireEvent.changeText( screen.getByTestId( "UniversalSearch.locationInput" ), "California" );

    expect( screen.getByTestId( "UniversalSearch.taxonInput" ).props.value )
      .toEqual( "cup plant" );
    expect( screen.getByTestId( "UniversalSearch.locationInput" ).props.value )
      .toEqual( "California" );
  } );

  it( "clears both fields when reset is pressed", ( ) => {
    renderComponent( <UniversalSearch /> );

    fireEvent.changeText( screen.getByTestId( "UniversalSearch.taxonInput" ), "cup plant" );
    fireEvent.changeText( screen.getByTestId( "UniversalSearch.locationInput" ), "California" );

    fireEvent.press( screen.getByText( i18next.t( "Reset-verb" ) ) );

    expect( screen.getByTestId( "UniversalSearch.taxonInput" ).props.value ).toEqual( "" );
    expect( screen.getByTestId( "UniversalSearch.locationInput" ).props.value ).toEqual( "" );
  } );
} );
