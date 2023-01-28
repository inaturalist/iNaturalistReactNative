import { fireEvent, screen } from "@testing-library/react-native";
import Projects from "components/Projects/Projects";

import factory from "../../../factory";
import { renderScreen } from "../../../helpers/render";

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
  const { getByTestId, getByText } = renderScreen( Projects, "Projects" );

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

describe( "Projects", () => {
  test( "should not have accessibility errors", async ( ) => {
    renderScreen( Projects, "Projects" );
    const projectObservations = await screen.findByTestId( "Projects" );
    expect( projectObservations ).toBeAccessible();
  } );
} );
