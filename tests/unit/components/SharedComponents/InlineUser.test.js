import { fireEvent, render, screen } from "@testing-library/react-native";
import InlineUser from "components/SharedComponents/InlineUser";
import React from "react";
import useIsConnected from "sharedHooks/useIsConnected";

import factory from "../../../factory";

jest.mock( "sharedHooks/useIsConnected" );
useIsConnected.mockReturnValue( true );

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
const mockUser2 = factory( "RemoteUser", { icon_url: null } );

describe( "InlineUser", ( ) => {
  it( "displays user handle and image correctly", ( ) => {
    render(
      <InlineUser user={mockUser} />
    );
    const profilePicture = screen.getByTestId( "InlineUser.ProfilePicture" );
    expect( screen.getByText( `@${mockUser.login}` ) ).toBeTruthy( );
    expect( profilePicture ).toBeTruthy( );
    expect( profilePicture.props.source ).toEqual( { uri: mockUser.icon_url } );
    expect( screen.queryByTestId( "InlineUser.FallbackPicture" ) ).not.toBeTruthy( );
  } );

  it( "displays user handle and and fallback image correctly", ( ) => {
    render(
      <InlineUser user={mockUser2} />
    );
    expect( screen.getByText( `@${mockUser2.login}` ) ).toBeTruthy( );
    expect( screen.queryByTestId( "InlineUser.ProfilePicture" ) ).not.toBeTruthy( );
    expect( screen.getByTestId( "InlineUser.FallbackPicture" ) ).toBeTruthy( );
  } );

  it( "fires onPress handler", ( ) => {
    render(
      <InlineUser user={mockUser} />
    );
    const inlineUserComponent = screen.getByRole( "link" );
    fireEvent.press( inlineUserComponent );
    expect( mockNavigate )
      .toHaveBeenCalledWith( "UserProfile", { userId: mockUser.id } );
  } );

  describe( "when offline", () => {
    beforeEach( () => {
      useIsConnected.mockReturnValue( false );
    } );

    afterEach( () => {
      useIsConnected.mockReturnValue( true );
    } );

    it( "displays no internet fallback image correctly", () => {
      render( <InlineUser user={mockUser} /> );
      expect( screen.getByText( `@${mockUser.login}` ) ).toBeTruthy();
      expect(
        screen.queryByTestId( "InlineUser.ProfilePicture" )
      ).not.toBeTruthy();
      expect( screen.getByTestId( "InlineUser.FallbackPicture" ) ).toBeTruthy();
    } );
  } );
} );
