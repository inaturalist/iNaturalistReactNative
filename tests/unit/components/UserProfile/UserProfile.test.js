import { render } from "@testing-library/react-native";
import React from "react";

import UserProfile from "../../../../src/components/UserProfile/UserProfile";
import ThemeProvider from "../../../../src/navigation/theme";
import factory from "../../../factory";

const testUser = factory( "RemoteUser" );
const mockExpected = testUser;

jest.mock( "../../../../src/components/UserProfile/hooks/useUser", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    user: mockExpected,
    currentUser: null
  } )
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        userId: mockExpected.id
      }
    } )
  };
} );

const renderUserProfile = ( ) => render(
  <ThemeProvider>
    <UserProfile />
  </ThemeProvider>
);

test( "renders user profile from API call", ( ) => {
  const { getByTestId, getByText } = renderUserProfile( );

  expect( getByTestId( `UserProfile.${testUser.id}` ) ).toBeTruthy( );
  expect( getByText( `@${testUser.login}` ) ).toBeTruthy( );
  expect( getByTestId( "UserIcon.photo" ).props.source )
    .toStrictEqual( { uri: testUser.icon_url } );
} );

test.todo( "should not have accessibility errors" );
// test( "should not have accessibility errors", ( ) => {
//   const userProfile = (
//     <ThemeProvider>
//       <UserProfile />
//     </ThemeProvider>
//   );
//   expect( userProfile ).toBeAccessible( );
// } );
