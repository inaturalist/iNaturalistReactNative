import { render } from "@testing-library/react-native";
import InlineUser from "components/SharedComponents/InlineUser";
import React from "react";

import factory from "../../../factory";

const mockUser = factory( "RemoteUser" );

describe( "InlineUser", ( ) => {
  it( "displays user handle and image correctly", ( ) => {
    const { getByText, queryByTestId } = render( <InlineUser user={mockUser} /> );
    expect( getByText( `@${mockUser.login}` ) ).toBeTruthy( );
    expect( queryByTestId( "InlineUser.ProfilePicture" ) ).toBeTruthy( );
    expect( queryByTestId( "InlineUser.FallbackPicture" ) ).not.toBeTruthy( );
  } );

  it( "displays user handle and and fallback image correctly", ( ) => {
    mockUser.icon_url = null;
    const { getByText, queryByTestId } = render( <InlineUser user={mockUser} /> );
    expect( getByText( `@${mockUser.login}` ) ).toBeTruthy( );
    expect( queryByTestId( "InlineUser.ProfilePicture" ) ).not.toBeTruthy( );
    expect( queryByTestId( "InlineUser.FallbackPicture" ) ).toBeTruthy( );
  } );
} );
