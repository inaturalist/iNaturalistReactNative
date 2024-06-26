import { fireEvent, screen } from "@testing-library/react-native";
import ProjectsContainer from "components/Projects/ProjectsContainer.tsx";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockedNavigate = jest.fn( );
const mockProject = factory( "RemoteProject", {
  icon: faker.image.url( ),
  title: faker.lorem.sentence( )
} );

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
      navigate: mockedNavigate,
      setOptions: jest.fn( )
    } ),
    useRoute: () => ( {} )
  };
} );

// react-native-paper's TextInput does a bunch of async stuff that's hard to
// control in a test, so we're just mocking it here.
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockTextInput = props => {
    const MockName = "mock-text-input";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  };
  MockTextInput.Icon = RealModule.TextInput.Icon;
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-props-no-spreading
    // TextInput: props => <View {...props}>{props.children}</View>
    TextInput: MockTextInput
  };
  return MockedModule;
} );

describe( "Projects", ( ) => {
  beforeAll( async ( ) => {
    jest.useFakeTimers( );
  } );

  it( "should not have accessibility errors", async ( ) => {
    const projects = <ProjectsContainer />;
    expect( projects ).toBeAccessible( );
  } );

  it( "should display project search results", ( ) => {
    renderComponent( <ProjectsContainer /> );

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
} );
