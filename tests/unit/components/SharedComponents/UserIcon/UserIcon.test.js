import { render, screen } from "@testing-library/react-native";
import { UserIcon } from "components/SharedComponents";
import React from "react";

const mockUri = { uri: "some_uri" };

describe( "UserIcon", () => {
  it( "should not have accessibility erros", () => {
    const userIcon = <UserIcon uri={mockUri} />;
    expect( userIcon ).toBeAccessible();
  } );

  it( "displays user image correctly", async () => {
    render( <UserIcon uri={mockUri} /> );

    // Check for image source
    const profilePicture = await screen.findByRole( "image" );
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

  it( "displays active user image correctly", async () => {
    render( <UserIcon uri={mockUri} active /> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
