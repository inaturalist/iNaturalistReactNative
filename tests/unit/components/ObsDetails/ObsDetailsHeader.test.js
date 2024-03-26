import { fireEvent, screen } from "@testing-library/react-native";
import ObsDetailsHeader from "components/ObsDetails/ObsDetailsHeader";
import i18next from "i18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "react-native/Libraries/Share/Share", () => ( {
  share: jest.fn( () => Promise.resolve( "mockResolve" ) )
} ) );

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( )
} ) );

describe( "ObsDetailsHeader", () => {
  it( "shows options menu when viewing someone else's observation", async ( ) => {
    renderComponent(
      <ObsDetailsHeader
        observation={factory( "RemoteObservation" )}
        belongsToCurrentUser={false}
      />
    );
    const anchorButton = screen.getByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeTruthy( );
    fireEvent.press( anchorButton );
    const shareButton = await screen.findByTestId( "MenuItem.Share" );
    expect( shareButton ).toBeTruthy( );
  } );

  it( "does not show options menu when observation belongs to current user", ( ) => {
    renderComponent(
      <ObsDetailsHeader
        observation={factory( "RemoteObservation" )}
        belongsToCurrentUser
      />
    );
    const editButton = screen.getByTestId( "ObsDetail.editButton" );
    expect( editButton ).toBeVisible( );
    const anchorButton = screen.queryByLabelText( i18next.t( "Observation-options" ) );
    expect( anchorButton ).toBeFalsy( );
  } );
} );
