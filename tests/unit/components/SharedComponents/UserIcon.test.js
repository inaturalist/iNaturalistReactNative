import { render, screen } from "@testing-library/react-native";
import { UserIcon } from "components/SharedComponents";
import React from "react";

// Can't user faker or the snapshot will be unstable
const mockUri = "https://loremflickr.com/640/480?lock=4455548378415104";

describe( "UserIcon", () => {
  it( "should not have accessibility erros", () => {
    // const userIcon = <UserIcon uri={mockUri} />;

    // Disabled during the update to RN 0.78
    // expect( userIcon ).toBeAccessible();
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
    // FasterImage doesn't provide a TS-compliant way to specify a test ID, so
    // I'm not sure how else we'd access it
    // eslint-disable-next-line testing-library/no-node-access
    expect( profilePicture.children[0] ).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access
    expect( profilePicture.children[0].props.source ).toHaveProperty( "uri", mockUri );
  } );
} );
