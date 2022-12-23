import { fireEvent } from "@testing-library/react-native";
import Projects from "components/Projects/Projects";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockedNavigate = jest.fn( );
const mockProject = factory( "RemoteProject" );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockProject]
  } )
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

test( "displays project search results", ( ) => {
  const { getByTestId, getByText } = renderComponent( <Projects /> );

  const input = getByTestId( "ProjectSearch.input" );
  fireEvent.changeText( input, "butterflies" );

  expect( getByText( mockProject.title ) ).toBeTruthy( );
  expect( getByTestId( `Project.${mockProject.id}.photo` ).props.source )
    .toStrictEqual( { uri: mockProject.icon } );
  fireEvent.press( getByTestId( `Project.${mockProject.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "ProjectDetails", {
    id: mockProject.id
  } );
} );
