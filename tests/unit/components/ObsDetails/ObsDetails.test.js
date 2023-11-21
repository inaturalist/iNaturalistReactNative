import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import initI18next from "i18n/initI18next";
import i18next, { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";
import { View } from "react-native";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useIsConnected from "sharedHooks/useIsConnected";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockObservation = factory( "LocalObservation", {
  _created_at: faker.date.past( ),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.datatype.number( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.imageUrl( )
      }
    } )
  ],
  taxon: factory( "LocalTaxon", {
    name: faker.name.firstName( ),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.name.fullName( ),
    defaultPhoto: {
      id: faker.datatype.number( ),
      attribution: faker.lorem.sentence( ),
      licenseCode: "cc-by-nc",
      url: faker.image.imageUrl( )
    }
  } ),
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.imageUrl( ),
    locale: "en"
  } ),
  identifications: []
} );
const mockNoEvidenceObservation = factory( "LocalObservation", {
  _created_at: faker.date.past( ),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  taxon: factory( "LocalTaxon", {
    name: faker.name.firstName( ),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.name.fullName( ),
    defaultPhoto: {
      id: faker.datatype.number( ),
      attribution: faker.lorem.sentence( ),
      licenseCode: "cc-by-nc",
      url: faker.image.imageUrl( )
    }
  } ),
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.imageUrl( ),
    locale: "en"
  } ),
  identifications: []
} );
mockNoEvidenceObservation.observationPhotos = [];
mockNoEvidenceObservation.observationSounds = [];

const mockNavigate = jest.fn();

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } ),
    useNavigation: () => ( {
      navigate: mockNavigate,
      addListener: jest.fn(),
      setOptions: jest.fn(),
      canGoBack: jest.fn()
    } )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    data: mockObservation
  } ) )
} ) );

jest.mock( "sharedHooks/useObservationsUpdates", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    refetch: jest.fn()
  } ) )
} ) );

const mockDataTab = <View testID="mock-data-tab" />;
jest.mock( "components/ObsDetails/DetailsTab/DetailsTab", () => ( {
  __esModule: true,
  default: () => mockDataTab
} ) );

jest.mock(
  "components/SharedComponents/ScrollViewWrapper",
  () => function MockContainer( props ) {
    const MockName = "mock-scroll-with-footer";
    // No testID here because the component needs the correct one to work‚
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  }
);

jest.mock( "sharedHooks/useIsConnected" );

const renderObsDetails = obs => renderComponent(
  <ObsEditContext.Provider value={{
    setPhotoEvidenceUris: jest.fn( ),
    observations: obs
  }}
  >
    <ObsDetailsContainer />
  </ObsEditContext.Provider>
);

describe( "ObsDetails", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should not have accessibility errors", async () => {
    renderObsDetails( [mockObservation] );
    const obsDetails = await screen.findByTestId(
      `ObsDetails.${mockObservation.uuid}`
    );
    expect( obsDetails ).toBeAccessible();
  } );

  it( "renders obs details from remote call", async () => {
    useIsConnected.mockImplementation( () => true );
    renderObsDetails( [mockObservation] );

    const obs = await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` );

    await waitFor( ( ) => {
      expect( obs ).toBeTruthy();
    } );
    expect( screen.getByText( mockObservation.taxon.name ) ).toBeTruthy();
  } );

  it( "renders data tab on button press", async () => {
    renderObsDetails( [mockObservation] );
    const button = await screen.findByTestId( "ObsDetails.DetailsTab" );
    expect( screen.queryByTestId( "mock-data-tab" ) ).not.toBeTruthy();

    fireEvent.press( button );
    expect( await screen.findByTestId( "mock-data-tab" ) ).toBeTruthy();
  } );

  it( "renders observed date of observation in header", async ( ) => {
    renderObsDetails( [mockObservation] );
    const observedDate = await screen.findByText(
      formatApiDatetime( mockObservation.time_observed_at, i18next.t )
    );
    expect( observedDate ).toBeVisible( );
    const createdDate = screen.queryByText(
      formatApiDatetime( mockObservation.created_at, i18next.t )
    );
    expect( createdDate ).toBeFalsy( );
  } );

  describe( "Observation with no evidence", () => {
    beforeEach( () => {
      useAuthenticatedQuery.mockReturnValue( {
        data: mockNoEvidenceObservation
      } );
    } );

    it( "should render fallback image icon instead of photos", async () => {
      useIsConnected.mockImplementation( () => true );
      renderObsDetails( [mockObservation] );

      const labelText = t( "Observation-has-no-photos-and-no-sounds" );
      const fallbackImage = await screen.findByLabelText( labelText );
      expect( fallbackImage ).toBeTruthy();
    } );

    afterEach( () => {
      useAuthenticatedQuery.mockReturnValue( {
        data: mockObservation
      } );
    } );
  } );

  describe( "activity tab", () => {
    it( "navigates to taxon details on button press", async () => {
      renderObsDetails( [mockObservation] );
      fireEvent.press(
        await screen.findByTestId(
          `ObsDetails.taxon.${mockObservation.taxon.id}`
        )
      );
      expect( mockNavigate ).toHaveBeenCalledWith( "TaxonDetails", {
        id: mockObservation.taxon.id
      } );
    } );

    it( "shows network error image instead of observation photos if user is offline", async () => {
      useIsConnected.mockImplementation( () => false );
      renderObsDetails( [mockObservation] );
      const labelText = t( "Observation-photos-unavailable-without-internet" );
      const noInternet = await screen.findByLabelText( labelText );
      expect( noInternet ).toBeTruthy();
      expect( screen.queryByTestId( "PhotoScroll.photo" ) ).toBeNull();
    } );
  } );
} );
