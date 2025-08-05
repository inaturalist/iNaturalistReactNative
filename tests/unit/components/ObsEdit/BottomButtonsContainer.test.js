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

function renderBottomButtonsContainer( props = {} ) {
  return renderComponent(
    <BottomButtonsContainer
      passesEvidenceTest
      observations={[]}
      currentObservation={mockObservation}
      currentObservationIndex={0}
      setCurrentObservationIndex={0}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      transitionAnimation={() => {}}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

describe( "BottomButtonsContainer", () => {
  it( "has no accessibility errors", () => {
    // Disabled during the update to RN 0.78
    // expect(
    //   <BottomButtonsContainer
    //     passesEvidenceTest
    //     observations={[]}
    //     currentObservation={mockObservation}
    //     currentObservationIndex={0}
    //     setCurrentObservationIndex={0}
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function
    //     transitionAnimation={() => {}}
    //     // eslint-disable-next-line react/jsx-props-no-spreading
    //   />
    // ).toBeAccessible();
  } );

  it( "shows save button when user is logged out", () => {
    renderBottomButtonsContainer();

    const save = screen.getByText( /SAVE/ );

    expect( save ).toBeVisible( );
  } );

  it( "shows save changes button when user logged in and observation was previously synced", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderBottomButtonsContainer( );

    const saveChanges = screen.getByText( /SAVE CHANGES/ );

    expect( saveChanges ).toBeVisible( );
  } );

  it( "shows save and upload button when user logged in with new observation", () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( ( ) => mockUser );
    renderBottomButtonsContainer( {
      currentObservation: factory( "LocalObservation" )
    } );

    const save = screen.getByText( /SAVE/ );
    expect( save ).toBeVisible( );
    const upload = screen.getByText( /UPLOAD/ );
    expect( upload ).toBeVisible( );
  } );
} );
