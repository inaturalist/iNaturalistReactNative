import { fireEvent, render, screen } from "@testing-library/react-native";
import { InlineUser } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate
    } )
  };
} );

const mockUser = factory( "RemoteUser" );
const mockUserWithoutImage = factory( "RemoteUser", { icon_url: null } );

const snapshotUser = { login: "some_login", icon_url: "some_icon_url" };
const snapshotUserWithoutImage = { login: "some_login", icon_url: null };

jest.mock(
  "components/SharedComponents/UserIcon/UserIcon",
  () => function MockUserIcon( ) {
    const MockName = "mockUserIcon";
    return <MockName testID={MockName} />;
  }
);

describe( "InlineUser", ( ) => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should not have accessibility erros", () => {
    const inlineUser = <InlineUser user={mockUser} />;
    expect( inlineUser ).toBeAccessible();
  } );

  it( "renders reliably", () => {
    // Snapshot test
    render( <InlineUser user={snapshotUser} isOnline /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "displays user handle and image correctly", async ( ) => {
    render( <InlineUser user={mockUser} isOnline /> );
    // Check for user name text
    expect( screen.getByText( `@${mockUser.login}` ) ).toBeTruthy( );
    // This image appears after useIsConnected returns true
    // so we have to use await and findByTestId
    const profilePicture = await screen.findByTestId( "mockUserIcon" );
    expect( profilePicture ).toBeTruthy( );
    expect( screen.queryByTestId( "InlineUser.FallbackPicture" ) ).not.toBeTruthy( );
    expect( screen.queryByTestId( "InlineUser.NoInternetPicture" ) ).not.toBeTruthy( );
  } );

  it( "fires onPress handler", ( ) => {
    render( <InlineUser user={mockUser} isOnline /> );

    const inlineUserComponent = screen.getByRole( "link" );
    fireEvent.press( inlineUserComponent );

    expect( mockNavigate )
      .toHaveBeenCalledWith( "UserProfile", { userId: mockUser.id } );
  } );

  describe( "when user has no icon set", () => {
    it( "displays user handle and fallback image correctly", async () => {
      render( <InlineUser user={mockUserWithoutImage} isOnline /> );

      expect( screen.getByText( `@${mockUserWithoutImage.login}` ) ).toBeTruthy();
      // This icon appears after useIsConnected returns true
      // so we have to use await and findByTestId
      expect(
        await screen.findByTestId( "InlineUser.FallbackPicture" )
      ).toBeTruthy();
      expect( screen.queryByTestId( "mockUserIcon" ) ).not.toBeTruthy();
      expect(
        screen.queryByTestId( "InlineUser.NoInternetPicture" )
      ).not.toBeTruthy();
    } );

    it( "renders reliably", ( ) => {
      // Snapshot test
      render( <InlineUser user={snapshotUserWithoutImage} isOnline /> );
      expect( screen ).toMatchSnapshot();
    } );
  } );

  describe( "when offline", () => {
    it( "displays no internet fallback image correctly", async () => {
      render( <InlineUser user={mockUser} isOnline={false} /> );

      expect( screen.getByText( `@${mockUser.login}` ) ).toBeTruthy();
      // This icon appears after useIsConnected returns false
      // so we have to use await and findByTestId
      expect( await screen.findByTestId( "InlineUser.NoInternetPicture" ) ).toBeTruthy();
      expect( screen.queryByTestId( "mockUserIcon" ) ).not.toBeTruthy();
      expect( screen.queryByTestId( "InlineUser.FallbackPicture" ) ).not.toBeTruthy( );
    } );

    it( "renders reliably", ( ) => {
      // Snapshot test
      render( <InlineUser user={snapshotUser} isOnline={false} /> );
      expect( screen ).toMatchSnapshot();
    } );
  } );
} );
