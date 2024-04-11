import { screen, userEvent } from "@testing-library/react-native";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup();

const mockNavigate = jest.fn();
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockNavigate
    } )
  };
} );

describe( "AddObsButton", ( ) => {
  beforeAll( ( ) => {
    jest.useFakeTimers( );
  } );

  it( "navigates user to AR camera", async ( ) => {
    renderComponent( <AddObsButton /> );

    const addObsButton = screen.getByLabelText(
      i18next.t( "Add-observations" )
    );
    expect( addObsButton ).toBeTruthy( );
    await actor.press( addObsButton );

    expect( mockNavigate ).toHaveBeenCalledWith( "CameraNavigator", {
      screen: "Camera",
      params: { camera: "AR", previousScreen: null }
    } );
  } );
} );

//     expect( noEvidenceButton ).toBeTruthy( );
//     await user.press( noEvidenceButton );
//     await waitFor( ( ) => {
//       expect( mockNavigate ).toHaveBeenCalledWith( "CameraNavigator", {
//         screen: "ObsEdit",
//         params: { previousScreen: null }
//       } );
//     } );
//   } );
// } );
