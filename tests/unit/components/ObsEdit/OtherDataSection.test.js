import { fireEvent, screen } from "@testing-library/react-native";
import OtherDataSection from "components/ObsEdit/OtherDataSection";
import React from "react";
import { Alert } from "react-native";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn( );
const mockUpdateObservationKeys = jest.fn( );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( { navigate: mockNavigate } ),
  };
} );

jest.mock( "sharedHooks/useFeatureFlag", () => ( {
  __esModule: true,
  default: jest.fn( () => true ),
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: jest.fn( () => null ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: [],
    isLoading: false,
    refetch: jest.fn( ),
  } ),
} ) );

function renderOtherDataSection( props = {} ) {
  return renderComponent(
    <OtherDataSection
      currentObservation={factory( "LocalObservation" )}
      updateObservationKeys={mockUpdateObservationKeys}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />,
  );
}

describe( "OtherDataSection", () => {
  beforeEach( () => {
    jest.clearAllMocks( );
    jest.spyOn( useCurrentUser, "default" ).mockReturnValue( null );
  } );

  it( "has no accessibility errors", () => {
    // const otherData = (
    //   <OtherDataSection />
    // );

    // Disabled during the update to RN 0.78
    // expect( otherData ).toBeAccessible();
  } );

  it( "opens notes sheet when notes dropdown is tapped", ( ) => {
    renderOtherDataSection( );

    const notesDropdown = screen.getByLabelText( /Add optional notes/ );
    expect( notesDropdown ).toBeVisible( );
    fireEvent.press( notesDropdown );

    const notesHeader = screen.getByText( /NOTES/ );
    expect( notesHeader ).toBeVisible( );
  } );

  it( "opens captive sheet when captive dropdown is tapped", ( ) => {
    renderOtherDataSection( );

    const captiveDropdown = screen.getByLabelText( /Select captive or cultivated status/ );
    fireEvent.press( captiveDropdown );

    const captiveHeader = screen.getByText( /WILD STATUS/ );
    expect( captiveHeader ).toBeVisible( );
  } );

  it( "opens geoprivacy sheet when geoprivacy dropdown is tapped", ( ) => {
    renderOtherDataSection( );

    const geoprivacyDropdown = screen.getByLabelText( /Select geoprivacy status/ );
    fireEvent.press( geoprivacyDropdown );

    const geoprivacyHeader = screen.getByText( /GEOPRIVACY/ );
    expect( geoprivacyHeader ).toBeVisible( );
  } );

  describe( "projects row", () => {
    it( "shows Add to Projects when no projects are selected", ( ) => {
      renderOtherDataSection( {
        currentObservation: {
          ...factory( "LocalObservation" ),
          projectObservations: [],
        },
      } );

      expect( screen.getByLabelText( /Add to Projects/ ) ).toBeVisible( );
      expect( screen.getByText( "Add to Projects" ) ).toBeVisible( );
    } );

    it( "shows Added to N Projects when projects are selected", ( ) => {
      renderOtherDataSection( {
        currentObservation: {
          ...factory( "LocalObservation" ),
          projectObservations: [{ projectId: 1 }, { projectId: 2 }],
        },
      } );

      expect( screen.getByLabelText( /Added to 2 Projects/ ) ).toBeVisible( );
      expect( screen.getByText( "Added to 2 Projects" ) ).toBeVisible( );
    } );

    it( "shows logged-out alert when projects row is tapped without a user", ( ) => {
      const alertSpy = jest.spyOn( Alert, "alert" ).mockImplementation( ( ) => undefined );
      renderOtherDataSection( );

      fireEvent.press( screen.getByLabelText( /Add to Projects/ ) );

      expect( alertSpy ).toHaveBeenCalledWith(
        "Please log in",
        "You need to be logged in to add observations to projects.",
      );
      expect( mockNavigate ).not.toHaveBeenCalled( );
    } );

    it( "navigates to AddToProjects when logged in", ( ) => {
      jest.spyOn( useCurrentUser, "default" ).mockReturnValue( factory( "LocalUser" ) );
      renderOtherDataSection( );

      fireEvent.press( screen.getByLabelText( /Add to Projects/ ) );

      expect( mockNavigate ).toHaveBeenCalledWith( "AddToProjects" );
    } );
  } );
} );
