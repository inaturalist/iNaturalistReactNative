import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import CustomTabBarContainer from "navigation/BottomTabNavigator/CustomTabBarContainer";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import * as useIsConnected from "sharedHooks/useIsConnected";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useFocusEffect: ( ) => jest.fn( )
  };
} );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  icon_url: faker.image.imageUrl( )
} );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: () => undefined
} ) );

describe( "CustomTabBar", () => {
  it( "should render correctly", () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "should not have accessibility errors", () => {
    const tabBar = <CustomTabBarContainer navigation={jest.fn( )} />;

    expect( tabBar ).toBeAccessible();
  } );

  it( "should display person icon while user is logged out", () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} isOnline /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    expect( personIcon ).toBeVisible( );
  } );

  it( "should display avatar while user is logged in", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} isOnline /> );

    const avatar = screen.getByTestId( "UserIcon.photo" );
    expect( avatar ).toBeVisible( );
  } );

  it( "should display person icon when connectivity is low", ( ) => {
    jest.spyOn( useIsConnected, "default" ).mockImplementation( () => false );
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} isOnline={false} /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    expect( personIcon ).toBeVisible( );
  } );
} );
