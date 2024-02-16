import { screen } from "@testing-library/react-native";
import BottomButtons from "components/ObsEdit/BottomButtons";
import faker from "tests/helpers/faker";
import initI18next from "i18n/initI18next";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  _synced_at: faker.date.past( )
} );

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: ( ) => null
} ) );

describe( "BottomButtons", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "has no accessibility errors", () => {
    const bottomButtons = (
      <BottomButtons />
    );

    expect( bottomButtons ).toBeAccessible();
  } );

  it( "shows save button when user is logged out", () => {
    renderComponent( <BottomButtons /> );

    const save = screen.getByText( /SAVE/ );

    expect( save ).toBeVisible( );
  } );

  it( "shows save changes button when user logged in and observation was previously synced", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderComponent( <BottomButtons
      currentObservation={mockObservation}
    /> );

    const saveChanges = screen.getByText( /SAVE CHANGES/ );

    expect( saveChanges ).toBeVisible( );
  } );

  it( "shows save and upload button when user logged in with new observation", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderComponent( <BottomButtons /> );

    const save = screen.getByText( /SAVE/ );
    expect( save ).toBeVisible( );
    const upload = screen.getByText( /UPLOAD/ );
    expect( upload ).toBeVisible( );
  } );
} );
