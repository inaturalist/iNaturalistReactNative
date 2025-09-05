import { render, screen } from "@testing-library/react-native";
import UserList from "components/UserList/UserList";
import React from "react";
import factory from "tests/factory";

const mockFollowers = [
  factory( "RemoteUser", {
    observation_count: 35
  } )
];

describe( "UserList", () => {
  it( "should render first follower in followers list", async ( ) => {
    render( <UserList users={mockFollowers} /> );
    const follower = await screen.findByText( mockFollowers[0].login );
    expect( follower ).toBeVisible();
  } );

  it( "should render observation count of first follower", async ( ) => {
    render( <UserList users={mockFollowers} /> );
    const observationCount = await screen
      .findByText( `${mockFollowers[0].observation_count} Observations` );
    expect( observationCount ).toBeVisible();
  } );
} );
