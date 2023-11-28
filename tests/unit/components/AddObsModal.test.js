import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import AddObsModal from "components/AddObsModal";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";
// eslint-disable-next-line import/no-unresolved
import mockPlatform from "react-native/Libraries/Utilities/Platform";

import { renderComponent } from "../../helpers/render";

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

const mockResetObsEdit = jest.fn( );
const mockUpdateObservations = jest.fn( );

const renderWithObsEditProvider = children => renderComponent(
  <ObsEditContext.Provider value={{
    resetObsEditContext: mockResetObsEdit,
    updateObservations: mockUpdateObservations
  }}
  >
    {children}
  </ObsEditContext.Provider>
);

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

describe( "AddObsModal", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  afterEach( () => {
    jest.clearAllMocks( );
  } );

  it( "navigates user to obs edit with no evidence", async ( ) => {
    renderWithObsEditProvider( <AddObsModal closeModal={jest.fn( )} /> );
    const noEvidenceButton = screen.getByLabelText(
      i18next.t( "Observation-with-no-evidence" )
    );
    expect( noEvidenceButton ).toBeTruthy( );
    fireEvent.press( noEvidenceButton );
    expect( mockResetObsEdit ).toHaveBeenCalledTimes( 1 );
    await waitFor( ( ) => {
      expect( mockUpdateObservations ).toHaveBeenCalledTimes( 1 );
    } );
    expect( mockNavigate ).toHaveBeenCalledWith( "CameraNavigator", {
      screen: "ObsEdit"
    } );
  } );

  it( "navigates user to AR camera on newer devices", async ( ) => {
    renderWithObsEditProvider( <AddObsModal closeModal={jest.fn( )} /> );
    const arCameraButton = screen.getByLabelText(
      i18next.t( "AR-Camera" )
    );
    expect( arCameraButton ).toBeTruthy( );
    fireEvent.press( arCameraButton );
    expect( mockResetObsEdit ).toHaveBeenCalledTimes( 1 );
    expect( mockUpdateObservations ).not.toHaveBeenCalled( );
    expect( mockNavigate ).toHaveBeenCalledWith( "CameraNavigator", {
      screen: "Camera",
      params: { camera: "AR" }
    } );
  } );

  it( "hides AR camera button on older devices", async ( ) => {
    mockPlatform.Version = 9;
    renderWithObsEditProvider( <AddObsModal closeModal={jest.fn( )} /> );
    const arCameraButton = screen.queryByLabelText(
      i18next.t( "AR-Camera" )
    );
    expect( arCameraButton ).toBeFalsy( );
  } );
} );
