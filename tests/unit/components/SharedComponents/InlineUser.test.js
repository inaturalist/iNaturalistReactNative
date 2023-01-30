import { fireEvent, render, screen } from "@testing-library/react-native";
import InlineUser from "components/SharedComponents/InlineUser";
import React from "react";
import useIsConnected from "sharedHooks/useIsConnected";

import factory from "../../../factory";

jest.mock( "sharedHooks/useIsConnected" );

const mockUser = factory( "RemoteUser" );
const mockUser2 = factory( "RemoteUser", { icon_url: null } );

describe( "InlineUser", ( ) => {
  it( "displays user handle and image correctly", ( ) => {
    useIsConnected.mockImplementation( ( ) => true );
    render(
      <InlineUser user={mockUser} onPress={jest.fn()} />
    );
    const profilePicture = screen.getByTestId( "InlineUser.ProfilePicture" );
    expect( screen.getByText( `@${mockUser.login}` ) ).toBeTruthy( );
    expect( profilePicture ).toBeTruthy( );
    expect( profilePicture.props.source ).toEqual( { uri: mockUser.icon_url } );
    expect( screen.queryByTestId( "InlineUser.FallbackPicture" ) ).not.toBeTruthy( );
  } );

  it( "displays user handle and and fallback image correctly", ( ) => {
    useIsConnected.mockImplementation( ( ) => true );
    render(
      <InlineUser user={mockUser2} onPress={jest.fn()} />
    );
    expect( screen.getByText( `@${mockUser2.login}` ) ).toBeTruthy( );
    expect( screen.queryByTestId( "InlineUser.ProfilePicture" ) ).not.toBeTruthy( );
    expect( screen.getByTestId( "InlineUser.FallbackPicture" ) ).toBeTruthy( );
  } );

  it( "displays user handle and and fallback image correctly when offline", ( ) => {
    useIsConnected.mockImplementation( ( ) => false );
    render(
      <InlineUser user={mockUser} onPress={jest.fn()} />
    );
    expect( screen.getByText( `@${mockUser.login}` ) ).toBeTruthy( );
    expect( screen.queryByTestId( "InlineUser.ProfilePicture" ) ).not.toBeTruthy( );
    expect( screen.getByTestId( "InlineUser.FallbackPicture" ) ).toBeTruthy( );
  } );

  it( "fires onPress handler", ( ) => {
    useIsConnected.mockImplementation( ( ) => true );
    const pressFunc = jest.fn();
    render(
      <InlineUser user={mockUser} onPress={pressFunc} />
    );
    const inlineUserComponent = screen.getByRole( "link" );
    fireEvent.press( inlineUserComponent );
    expect( pressFunc ).toHaveBeenCalledTimes( 1 );
  } );
} );
