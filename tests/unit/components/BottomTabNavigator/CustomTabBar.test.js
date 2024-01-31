import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import CustomTabBarContainer from "navigation/BottomTabNavigator/CustomTabBarContainer";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import * as useIsConnected from "sharedHooks/useIsConnected";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  icon_url: faker.image.url( )
} );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: () => undefined
} ) );

describe( "CustomTabBar", () => {
  it( "should render correctly", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    await expect( screen ).toMatchSnapshot();
  } );

  it( "should not have accessibility errors", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    await expect( screen ).toBeAccessible();
  } );

  it( "should display person icon while user is logged out", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} isOnline /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    await expect( personIcon ).toBeVisible( );
  } );

  it( "should display avatar while user is logged in", async () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} isOnline /> );

    const avatar = screen.getByTestId( "UserIcon.photo" );
    await expect( avatar ).toBeVisible( );
  } );

  it( "should display person icon when connectivity is low", async ( ) => {
    jest.spyOn( useIsConnected, "default" ).mockImplementation( () => false );
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} isOnline={false} /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    await expect( personIcon ).toBeVisible( );
  } );
} );
