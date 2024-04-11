import { screen } from "@testing-library/react-native";
import CustomTabBarContainer from "navigation/BottomTabNavigator/CustomTabBarContainer";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import * as useIsConnected from "sharedHooks/useIsConnected.ts";
import * as useStorage from "sharedHooks/useStorage.ts";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  icon_url: faker.image.url( )
} );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: () => undefined
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: 0
  } )
} ) );

describe( "CustomTabBar", () => {
  beforeEach( ( ) => {
    jest.useFakeTimers();
  } );

  it( "should render correctly", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    await expect( screen ).toMatchSnapshot();
  } );

  it( "should not have accessibility errors", async () => {
    const tabBar = <CustomTabBarContainer navigation={jest.fn( )} />;

    await expect( tabBar ).toBeAccessible();
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

describe( "CustomTabBar with advanced user layout", () => {
  beforeEach( ( ) => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn( useStorage, "default" ).mockImplementation( () => ( {
      isAdvancedUser: true
    } ) );
  } );

  it( "should render correctly", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    await expect( screen ).toMatchSnapshot();
  } );

  it( "should not have accessibility errors", async () => {
    const tabBar = <CustomTabBarContainer navigation={jest.fn( )} />;

    await expect( tabBar ).toBeAccessible();
  } );
} );
