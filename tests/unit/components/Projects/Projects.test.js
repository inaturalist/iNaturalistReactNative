import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import Projects from "../../../../src/components/Projects/Projects";

const mockedNavigate = jest.fn( );
const mockProject = factory( "RemoteProject" );

const mockLatLng = {
  latitude: 37.77,
  longitude: -122.42
};

// Mock the hooks we use on Map since we're not trying to test them here
jest.mock( "../../../../src/sharedHooks/useUserLocation" , ( ) => ( {
  useUserLocation: ( ) => {
    return mockLatLng;
  }
} ) );

jest.mock( "../../../../src/components/Projects/hooks/useProjects" , ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return [mockProject];
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

const renderProjects = () => render(
  <NavigationContainer>
    <Projects />
  </NavigationContainer>
);

test( "displays project search results", ( ) => {
  const { getByTestId, getByText } = renderProjects( );

  const input = getByTestId( "ProjectSearch.input" );
  fireEvent.changeText( input, "butterflies" );

  expect( getByText( mockProject.title ) ).toBeTruthy( );
  expect( getByTestId( `Project.${mockProject.id}.photo` ).props.source ).toStrictEqual( { "uri": mockProject.icon } );
  fireEvent.press( getByTestId( `Project.${mockProject.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "ProjectDetails", {
    id: mockProject.id
  } );
} );

