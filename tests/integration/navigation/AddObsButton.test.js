import { screen, userEvent } from "@testing-library/react-native";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import i18next from "i18next";
import React from "react";
import * as useStorage from "sharedHooks/useStorage.ts";
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

describe( "with advanced user layout", ( ) => {
  beforeAll( ( ) => {
    jest.useFakeTimers( );
    jest.spyOn( useStorage, "default" ).mockImplementation( () => ( {
      isAdvancedUser: true
    } ) );
  } );

  it( "opens AddObsModal", async ( ) => {
    renderComponent( <AddObsButton /> );

    const addObsButton = screen.getByLabelText(
      i18next.t( "Add-observations" )
    );
    expect( addObsButton ).toBeTruthy( );
    await actor.press( addObsButton );

    const noEvidenceButton = screen.getByLabelText(
      i18next.t( "Observation-with-no-evidence" )
    );
    expect( noEvidenceButton ).toBeTruthy( );
  } );

  it( "navigates user to obs edit with no evidence", async ( ) => {
    renderComponent( <AddObsButton /> );

    const addObsButton = screen.getByLabelText(
      i18next.t( "Add-observations" )
    );
    expect( addObsButton ).toBeTruthy( );
    await actor.press( addObsButton );

    const noEvidenceButton = screen.getByLabelText(
      i18next.t( "Observation-with-no-evidence" )
    );
    expect( noEvidenceButton ).toBeTruthy( );
    await actor.press( noEvidenceButton );

    expect( mockNavigate ).toHaveBeenCalledWith( "CameraNavigator", {
      screen: "ObsEdit",
      params: { previousScreen: null }
    } );
  } );
} );
