import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import UserProfile from "components/UserProfile/UserProfile";
import React from "react";

import factory from "../../../factory";

const testUser = factory( "RemoteUser" );
const mockUser = testUser;

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
    useRoute: ( ) => ( {
      params: {
        userId: mockUser.id
      }
    } )
  };
} );

const queryClient = new QueryClient( );

const renderUserProfile = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <UserProfile />
    </NavigationContainer>
  </QueryClientProvider>
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
