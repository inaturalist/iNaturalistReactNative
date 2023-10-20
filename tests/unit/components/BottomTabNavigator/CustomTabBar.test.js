import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import CustomTabBarContainer from "navigation/BottomTabNavigator/CustomTabBarContainer";
import React from "react";
import * as currentUser from "sharedHooks/useCurrentUser";

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

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

describe( "CustomTabBar", () => {
  afterEach( () => {
    // Clear mocks after each test to handle different cases of realm.write being called or not
    jest.clearAllMocks();
  } );
  // it( "should render correctly", () => {
  //   renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

  //   expect( screen ).toMatchSnapshot();
  // } );

  it( "should not have accessibility errors", () => {
    const tabBar = <CustomTabBarContainer navigation={jest.fn( )} />;

    expect( tabBar ).toBeAccessible();
  } );

  it( "should display avatar while user is logged in", () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    const avatar = screen.getByTestId( "UserIcon.photo" );
    expect( avatar ).toBeVisible( );
  } );

  it( "should display person icon while user is logged out", () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    jest.spyOn( currentUser, "default" ).mockImplementation( () => undefined );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    expect( personIcon ).toBeVisible( );
  } );
} );
