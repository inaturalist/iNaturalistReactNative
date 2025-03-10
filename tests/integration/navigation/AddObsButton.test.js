import { screen, userEvent } from "@testing-library/react-native";
import AddObsButton from "components/AddObsModal/AddObsButton.tsx";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup();

const mockDispatch = jest.fn();
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      dispatch: mockDispatch
    } )
  };
} );

const resetNavigation = ( name, params ) => ( {
  payload: {
    index: 0,
    routes: [{
      name: "NoBottomTabStackNavigator",
      state: {
        index: 0,
        routes: [{
          name,
          params
        }]
      }
    }]
  },
  type: "RESET"
} );

beforeAll( ( ) => {
  jest.useFakeTimers( );
} );

describe( "AddObsButton", ( ) => {
  it( "navigates user to AI camera", async ( ) => {
    renderComponent( <AddObsButton /> );

    const addObsButton = screen.getByLabelText(
      i18next.t( "Add-observations" )
    );
    expect( addObsButton ).toBeTruthy( );
    await actor.press( addObsButton );

    expect( mockDispatch ).toHaveBeenCalledWith(
      resetNavigation( "Camera", { camera: "AI", previousScreen: null } )
    );
  } );
} );

describe( "with advanced user layout", ( ) => {
  beforeEach( ( ) => {
    useStore.setState( { isAdvancedUser: true } );
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

    expect( mockDispatch ).toHaveBeenCalledWith(
      resetNavigation( "ObsEdit", { previousScreen: null } )
    );
  } );
} );
