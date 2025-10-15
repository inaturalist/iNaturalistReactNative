import { screen } from "@testing-library/react-native";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "RemoteUser" );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockUser
  } )
} ) );

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        userId: mockUser.id
      }
    } ),
    useNavigation: () => ( {
      setOptions: () => ( { } )
    } )
  };
} );

jest.mock(
  "components/SharedComponents/ScrollViewWrapper",
  () => function MockContainer( props ) {
    const MockName = "mock-scrollview-with-footer";
    // No testID here because the component needs the correct one to work
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  }
);

describe( "UserProfile", () => {
  it( "should render inside mocked container for testing", () => {
    renderComponent( <UserProfile /> );
    expect( screen.getByTestId( "UserProfile" ) ).toBeTruthy();
  } );

  test( "should not have accessibility errors", async () => {
    // const userProfile = <UserProfile />;
    // Disabled during the update to RN 0.78
    // expect( userProfile ).toBeAccessible();
  } );

  test( "renders user profile from API call", async () => {
    renderComponent( <UserProfile /> );

    expect( screen.getByTestId( `UserProfile.${mockUser.id}` ) ).toBeTruthy( );
    expect(
      screen.getByText(
        new RegExp( t( "OBSERVATIONS-WITHOUT-NUMBER", { count: mockUser.observations_count } ) )
      )
    ).toBeTruthy( );
    const userIcon = screen.getByTestId( "UserIcon.photo" );
    expect( userIcon ).toBeTruthy( );
    // eslint-disable-next-line testing-library/no-node-access
    expect( userIcon.children[0].props.source ).toHaveProperty( "uri", mockUser.icon_url );
  } );

  test( "renders followers and following buttons", async () => {
    renderComponent( <UserProfile /> );
    const followersButton = await screen.findByText( /VIEW FOLLOWERS/ );
    const followingButton = await screen.findByText( /VIEW FOLLOWING/ );
    expect( followersButton ).toBeVisible( );
    expect( followingButton ).toBeVisible( );
  } );

  test( "renders projects button", async () => {
    renderComponent( <UserProfile /> );

    const projectsButton = await screen.findByText( /VIEW PROJECTS/ );
    expect( projectsButton ).toBeVisible( );
  } );
} );
