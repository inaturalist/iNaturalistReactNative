import { render, screen } from "@testing-library/react-native";
import { UserIcon } from "components/SharedComponents";
import React from "react";

import factory from "../../../../factory";

const mockUser = factory( "RemoteUser" );
const mockUri = { uri: mockUser.icon_url };

describe( "UserIcon", () => {
  it( "displays user image correctly", async () => {
    render( <UserIcon uri={mockUri} /> );

    // Check for image source
    const profilePicture = await screen.findByTestId( "UserIcon.photo" );
    expect( profilePicture ).toBeTruthy();
    expect( profilePicture.props.source ).toEqual( mockUri );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays small user image correctly", async () => {
    render( <UserIcon uri={mockUri} small /> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
