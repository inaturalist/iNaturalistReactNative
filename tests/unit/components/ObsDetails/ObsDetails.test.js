import { fireEvent, screen } from "@testing-library/react-native";
import ObsDetails from "components/ObsDetails/ObsDetails";
import initializeI18next from "i18n";
import { t } from "i18next";
import React from "react";
import { View } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useIsConnected from "sharedHooks/useIsConnected";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockNavigate = jest.fn( );
const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );
const mockNoEvidenceObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );
mockNoEvidenceObservation.observationPhotos = [];
mockNoEvidenceObservation.observationSounds = [];
const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } ),
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      addListener: jest.fn( ),
      setOptions: jest.fn( )
    } )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    data: mockObservation
  } ) )
} ) );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: ( ) => null
  } )
} ) );

jest.mock( "components/ObsDetails/AddCommentModal" );
jest.mock( "components/ObsDetails/ActivityTab" );
jest.mock( "components/SharedComponents/PhotoScroll" );

const mockDataTab = <View testID="mock-data-tab" />;
jest.mock( "components/ObsDetails/DataTab", () => ( {
  __esModule: true,
  default: () => mockDataTab
} ) );

jest.mock(
  "components/SharedComponents/ScrollWithFooter",
  () => function MockContainer( props ) {
    const MockName = "mock-scroll-with-footer";
    // No testID here because the component needs the correct one to work‚
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  }
);

jest.mock( "sharedHooks/useIsConnected" );

const mockLatLng = factory( "DeviceLocation" );

jest.mock( "sharedHooks/useUserLocation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { latLng: mockLatLng } )
} ) );

describe( "ObsDetails", () => {
  beforeAll( async ( ) => {
    await initializeI18next( );
  } );

  it( "should not have accessibility errors", async () => {
    renderComponent( <ObsDetails /> );
    const obsDetails = await screen.findByTestId(
      `ObsDetails.${mockObservation.uuid}`
    );
    expect( obsDetails ).toBeAccessible();
  } );

  it( "renders obs details from remote call", async ( ) => {
    useIsConnected.mockImplementation( ( ) => true );
    renderComponent( <ObsDetails /> );

    expect( await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` ) ).toBeTruthy( );
    expect( screen.getByText( mockObservation.taxon.name ) ).toBeTruthy( );
  } );

  it( "renders data tab on button press", async ( ) => {
    renderComponent( <ObsDetails /> );
    const button = await screen.findByTestId( "ObsDetails.DataTab" );
    expect( screen.queryByTestId( "mock-data-tab" ) ).not.toBeTruthy( );

    fireEvent.press( button );
    expect( await screen.findByTestId( "mock-data-tab" ) ).toBeTruthy();
  } );

  describe( "Observation with no evidence", () => {
    beforeEach( () => {
      useAuthenticatedQuery.mockReturnValue( {
        data: mockNoEvidenceObservation
      } );
    } );

    it( "should render fallback image icon instead of photos", async () => {
      useIsConnected.mockImplementation( ( ) => true );
      renderComponent( <ObsDetails /> );

      const labelText = t( "Observation-has-no-photos-and-no-sounds" );
      const fallbackImage = await screen.findByLabelText( labelText );
      expect( fallbackImage ).toBeTruthy( );
    } );

    afterEach( () => {
      useAuthenticatedQuery.mockReturnValue( {
        data: mockObservation
      } );
    } );
  } );

  describe( "activity tab", ( ) => {
    it( "navigates to taxon details on button press", async ( ) => {
      renderComponent( <ObsDetails /> );
      fireEvent.press(
        await screen.findByTestId( `ObsDetails.taxon.${mockObservation.taxon.id}` )
      );
      expect( mockNavigate ).toHaveBeenCalledWith( "TaxonDetails", {
        id: mockObservation.taxon.id
      } );
    } );

    it( "shows network error image instead of observation photos if user is offline", async ( ) => {
      useIsConnected.mockImplementation( ( ) => false );
      renderComponent( <ObsDetails /> );
      const labelText = t( "Observation-photos-unavailable-without-internet" );
      const noInternet = await screen.findByLabelText( labelText );
      expect( noInternet ).toBeTruthy( );
      expect( screen.queryByTestId( "PhotoScroll.photo" ) ).toBeNull( );
    } );
  } );
} );
