import { screen, userEvent } from "@testing-library/react-native";
import AddObsButton from "components/AddObsModal/AddObsButton";
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

const longPress = async ( ) => {
  const addObsButton = screen.getByLabelText(
    i18next.t( "Add-observations" )
  );
  expect( addObsButton ).toBeTruthy( );
  await actor.longPress( addObsButton );
};

const showNoEvidenceOption = ( ) => {
  const noEvidenceButton = screen.getByLabelText(
    i18next.t( "Observation-with-no-evidence" )
  );
  expect( noEvidenceButton ).toBeTruthy( );
  return noEvidenceButton;
};

const regularPress = async ( ) => {
  const addObsButton = screen.getByLabelText(
    i18next.t( "Add-observations" )
  );
  expect( addObsButton ).toBeTruthy( );
  await actor.press( addObsButton );
};

describe( "AddObsButton", ( ) => {
  it( "navigates user to AI camera", async ( ) => {
    renderComponent( <AddObsButton /> );
    await regularPress( );

    expect( mockDispatch ).toHaveBeenCalledWith(
      resetNavigation( "Camera", { camera: "AI", previousScreen: null } )
    );
  } );

  it( "opens model on long press", async ( ) => {
    renderComponent( <AddObsButton /> );
    await longPress( );
    showNoEvidenceOption( );
  } );
} );

describe( "with advanced user layout", ( ) => {
  const initialState = useStore.getInitialState( );
  beforeEach( ( ) => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
        isAllAddObsOptionsMode: true
      }
    } );
  } );

  it( "opens AddObsModal", async ( ) => {
    renderComponent( <AddObsButton /> );
    await regularPress( );
    showNoEvidenceOption( );
  } );

  it( "navigates user to obs edit with no evidence", async ( ) => {
    renderComponent( <AddObsButton /> );
    await regularPress( );

    const noEvidenceButton = showNoEvidenceOption( );
    await actor.press( noEvidenceButton );

    expect( mockDispatch ).toHaveBeenCalledWith(
      resetNavigation( "ObsEdit", { previousScreen: null } )
    );
  } );

  it( "does not open model on long press", async ( ) => {
    renderComponent( <AddObsButton /> );
    await longPress( );

    const noEvidenceButton = screen.queryByLabelText(
      i18next.t( "Observation-with-no-evidence" )
    );
    expect( noEvidenceButton ).toBeFalsy( );
  } );

  describe( "with advanced AICamera-only setting", ( ) => {
    beforeEach( ( ) => {
      useStore.setState( {
        layout: {
          ...initialState.layout,
          isDefaultMode: false,
          isAllAddObsOptionsMode: false
        }
      } );
    } );

    it( "opens model on long press", async ( ) => {
      renderComponent( <AddObsButton /> );
      await longPress( );
      showNoEvidenceOption( );
    } );
  } );
} );
