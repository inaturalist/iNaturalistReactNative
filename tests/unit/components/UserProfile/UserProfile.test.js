import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import UserProfile from "components/UserProfile/UserProfile";
import React from "react";

import factory from "../../../factory";

const mockUser = factory( "RemoteUser" );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockUser
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
    } ),
    useNavigation: ( ) => ( {
      setOptions: ( ) => ( {
        headerTitle: `@${mockUser.login}`
      } )
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

test( "renders user profile from API call", async ( ) => {
  const { getByTestId, getByText } = renderUserProfile( );

  expect( getByTestId( `UserProfile.${mockUser.id}` ) ).toBeTruthy( );
  expect( getByText( `iNaturalist ${mockUser.roles[0]}` ) ).toBeTruthy( );
  expect( getByTestId( "UserIcon.photo" ).props.source )
    .toStrictEqual( { uri: mockUser.icon_url } );
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
