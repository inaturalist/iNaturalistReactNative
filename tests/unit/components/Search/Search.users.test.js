import { fireEvent } from "@testing-library/react-native";
import Search from "components/Search/Search";

import factory from "../../../factory";
import { renderScreen } from "../../../helpers/render";

// TODO: figure out how to clear jest mocks correctly or return a different
// value from jest mocks so these can all live in a single file?

const mockedNavigate = jest.fn( );

const mockUser = factory( "RemoteUser" );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockUser]
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

const { login } = mockUser;

test( "displays user search results on button press", ( ) => {
  const { getByTestId, getByText } = renderScreen( Search, "Search" );
  const button = getByTestId( "Search.users" );

  fireEvent.press( button );
  expect( getByTestId( `Search.user.${login}` ) ).toBeTruthy( );
  expect( getByTestId( `Search.${login}.photo` ).props.source ).toStrictEqual( {
    uri: mockUser.icon
  } );
  expect( getByText( new RegExp( login ) ) ).toBeTruthy( );
} );

test( "navigates to user profile on button press", ( ) => {
  const { getByTestId } = renderScreen( Search, "Search" );
  const button = getByTestId( "Search.users" );

  fireEvent.press( button );
  fireEvent.press( getByTestId( `Search.user.${login}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", { userId: mockUser.id } );
} );
