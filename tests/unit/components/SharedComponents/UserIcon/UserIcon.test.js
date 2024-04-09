import { render, screen } from "@testing-library/react-native";
import { UserIcon } from "components/SharedComponents";
import React from "react";

const mockUri = { uri: "some_uri" };

describe( "UserIcon", () => {
  it( "should not have accessibility erros", () => {
    const userIcon = <UserIcon uri={mockUri} />;

    expect( userIcon ).toBeAccessible();
  } );

  it( "displays user image correctly", () => {
    render( <UserIcon uri={mockUri} /> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays small user image correctly", () => {
    render( <UserIcon uri={mockUri} small /> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays active user image correctly", () => {
    render( <UserIcon uri={mockUri} active /> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "shows correct uri for the user icon image", () => {
    render( <UserIcon uri={mockUri} active /> );

    // TODO: replace with getByRole
    const profilePicture = screen.getByTestId( "UserIcon.photo" );
    expect( profilePicture ).toBeTruthy();
    expect( profilePicture.props.source ).toHaveProperty( "url", mockUri.uri );
  } );
} );
