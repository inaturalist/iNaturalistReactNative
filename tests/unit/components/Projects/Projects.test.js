import { fireEvent, screen } from "@testing-library/react-native";
import ProjectsContainer from "components/Projects/ProjectsContainer.tsx";
import React from "react";
import { useAuthenticatedInfiniteQuery } from "sharedHooks";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockedNavigate = jest.fn( );
const mockProject = factory( "RemoteProject", {
  icon: faker.image.url( ),
  title: faker.lorem.sentence( ),
  project_type: "collection"
} );

const mockProjectWithDateRange = factory( "RemoteProject", {
  ...mockProject,
  rule_preferences: [
    {
      field: "d1",
      value: "2024-03-07 07:42 -06:00"
    },
    {
      field: "d2",
      value: "2024-03-14 08:41 -07:00"
    }
  ]
} );

const infiniteScrollResults = results => ( {
  data: {
    pages: [{
      results
    }]
  }
} );

jest.mock( "sharedHooks/useAuthenticatedInfiniteQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => infiniteScrollResults( [mockProject] ) )
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate,
      setOptions: jest.fn( ),
      addListener: jest.fn( )
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

  // it( "should not have accessibility errors", async ( ) => {
  //   const projects = <ProjectsContainer />;
  //   expect( projects ).toBeAccessible( );
  // } );

  test( "should display project search results", ( ) => {
    useAuthenticatedInfiniteQuery.mockImplementation( ( ) => infiniteScrollResults(
      [mockProject]
    ) );
    renderComponent( <ProjectsContainer /> );

    const input = screen.getByTestId( "ProjectSearch.input" );
    fireEvent.changeText( input, "butterflies" );

    expect( screen.getByText( mockProject.title ) ).toBeTruthy( );
    expect( screen.getByTestId( `Project.${mockProject.id}.photo` ).props.source )
      .toMatchObject( { url: mockProject.icon } );
    fireEvent.press( screen.getByTestId( `Project.${mockProject.id}` ) );
    expect( mockedNavigate ).toHaveBeenCalledWith( "ProjectDetails", {
      id: mockProject.id
    } );
  } );

  test( "should display date range if collection project has date range", async ( ) => {
    useAuthenticatedInfiniteQuery.mockImplementation( ( ) => infiniteScrollResults(
      [mockProjectWithDateRange]
    ) );
    renderComponent( <ProjectsContainer /> );
    const input = screen.getByTestId( "ProjectSearch.input" );
    fireEvent.changeText( input, "" );
    const dateRange = await screen.findByText( "Mar 7, 2024 - Mar 14, 2024" );
    expect( dateRange ).toBeTruthy( );
  } );

  test( "should display project type if collection project has no date range", async ( ) => {
    useAuthenticatedInfiniteQuery.mockImplementation( ( ) => infiniteScrollResults(
      [mockProject]
    ) );
    renderComponent( <ProjectsContainer /> );
    const projectTypeText = await screen.findByText( /Collection Project/ );
    expect( projectTypeText ).toBeTruthy( );
  } );

  test( "should display project type if project is traditional project", async ( ) => {
    useAuthenticatedInfiniteQuery.mockImplementation( ( ) => infiniteScrollResults(
      [{
        ...mockProjectWithDateRange,
        project_type: "traditional"
      }]
    ) );
    renderComponent( <ProjectsContainer /> );
    const projectTypeText = await screen.findByText( /Traditional Project/ );
    expect( projectTypeText ).toBeTruthy( );
  } );

  test( "should display date range if umbrella project has date range", async ( ) => {
    useAuthenticatedInfiniteQuery.mockImplementation( ( ) => infiniteScrollResults(
      [{
        ...mockProjectWithDateRange,
        project_type: "umbrella"
      }]
    ) );
    renderComponent( <ProjectsContainer /> );
    const input = screen.getByTestId( "ProjectSearch.input" );
    fireEvent.changeText( input, "" );
    const dateRange = await screen.findByText( "Mar 7, 2024 - Mar 14, 2024" );
    expect( dateRange ).toBeTruthy( );
  } );
} );
