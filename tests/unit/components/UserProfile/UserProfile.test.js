import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import UserProfile from "../../../../src/components/UserProfile/UserProfile";

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
  <NavigationContainer>
    <UserProfile />
  </NavigationContainer>
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
//     <NavigationContainer>
//       <UserProfile />
//     </NavigationContainer>
//   );
//   expect( userProfile ).toBeAccessible( );
// } );
