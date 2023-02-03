import { fireEvent, screen } from "@testing-library/react-native";
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
    useNavigation: () => ( {
      navigate: mockedNavigate
    } ),
    useRoute: () => ( {} )
  };
} );

test( "displays project search results", ( ) => {
  renderComponent( <Projects /> );

  const input = screen.getByTestId( "ProjectSearch.input" );
  fireEvent.changeText( input, "butterflies" );

  expect( screen.getByText( mockProject.title ) ).toBeTruthy( );
  expect( screen.getByTestId( `Project.${mockProject.id}.photo` ).props.source )
    .toStrictEqual( { uri: mockProject.icon } );
  fireEvent.press( screen.getByTestId( `Project.${mockProject.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "ProjectDetails", {
    id: mockProject.id
  } );
} );

describe( "Projects", () => {
  test( "should not have accessibility errors", async ( ) => {
    renderComponent( <Projects /> );
    const projectObservations = await screen.findByTestId( "Projects" );
    expect( projectObservations ).toBeAccessible();
  } );
} );
