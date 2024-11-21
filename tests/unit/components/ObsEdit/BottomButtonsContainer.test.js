import { screen } from "@testing-library/react-native";
import BottomButtonsContainer from "components/ObsEdit/BottomButtonsContainer.tsx";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  _synced_at: faker.date.past( )
} );

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: ( ) => null
} ) );

describe( "BottomButtonsContainer", () => {
  it( "has no accessibility errors", () => {
    expect( <BottomButtonsContainer /> ).toBeAccessible();
  } );

  it( "shows save button when user is logged out", () => {
    renderComponent( <BottomButtonsContainer /> );

    const save = screen.getByText( /SAVE/ );

    expect( save ).toBeVisible( );
  } );

  it( "shows save changes button when user logged in and observation was previously synced", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderComponent( <BottomButtonsContainer
      currentObservation={mockObservation}
    /> );

    const saveChanges = screen.getByText( /SAVE CHANGES/ );

    expect( saveChanges ).toBeVisible( );
  } );

  it( "shows save and upload button when user logged in with new observation", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderComponent( <BottomButtonsContainer /> );

    const save = screen.getByText( /SAVE/ );
    expect( save ).toBeVisible( );
    const upload = screen.getByText( /UPLOAD/ );
    expect( upload ).toBeVisible( );
  } );
} );
