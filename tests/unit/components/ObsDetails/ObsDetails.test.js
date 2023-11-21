import { faker } from "@faker-js/faker";
import { useRoute } from "@react-navigation/native";
import { fireEvent, screen } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import initI18next from "i18n/initI18next";
import i18next, { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";
import { View } from "react-native";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useIsConnected from "sharedHooks/useIsConnected";
import useLocalObservation from "sharedHooks/useLocalObservation";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
jest.mock( "providers/ObsEditProvider" );

jest.mock( "sharedHooks/useLocalObservation" );

const mockNavigate = jest.fn();
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
  } )
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
  } )
} );
mockNoEvidenceObservation.observationPhotos = [];
mockNoEvidenceObservation.observationSounds = [];
const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.imageUrl( )
} );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

useRoute.mockImplementation( ( ) => ( {
  params: { uuid: mockObservation.uuid }
} ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ),
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

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: () => null
  } )
} ) );

jest.mock( "components/ObsDetails/ActivityTab/ActivityTab" );
jest.mock( "components/SharedComponents/PhotoScroll" );

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

const mockLatLng = {
  latitude: Number( faker.address.latitude( ) ),
  longitude: Number( faker.address.longitude( ) )
};

jest.mock( "sharedHooks/useUserLocation", () => ( {
  __esModule: true,
  default: () => ( { latLng: mockLatLng } )
} ) );

const mockObsEditProviderWithObs = observations => ObsEditProvider.mockImplementation(
  ( { children } ) => (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <INatPaperProvider>
      <ObsEditContext.Provider value={{
        setPhotoEvidenceUris: jest.fn( ),
        observations
      }}
      >
        {children}
      </ObsEditContext.Provider>
    </INatPaperProvider>
  )
);

const renderObsDetails = ( ) => renderComponent(
  <ObsEditProvider>
    <ObsDetailsContainer />
  </ObsEditProvider>
);

describe( "ObsDetails", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "should not have accessibility errors", async () => {
    mockObsEditProviderWithObs( [mockObservation] );
    renderObsDetails( );
    const obsDetails = await screen.findByTestId(
      `ObsDetails.${mockObservation.uuid}`
    );
    expect( obsDetails ).toBeAccessible();
  } );

  it( "renders obs details from remote call", async () => {
    useIsConnected.mockImplementation( () => true );
    mockObsEditProviderWithObs( [mockObservation] );
    renderObsDetails( );

    expect(
      await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` )
    ).toBeTruthy();
    expect( screen.getByText( mockObservation.taxon.name ) ).toBeTruthy();
  } );

  it( "renders data tab on button press", async () => {
    mockObsEditProviderWithObs( [mockObservation] );
    renderObsDetails( );
    const button = await screen.findByTestId( "ObsDetails.DetailsTab" );
    expect( screen.queryByTestId( "mock-data-tab" ) ).not.toBeTruthy();

    fireEvent.press( button );
    expect( await screen.findByTestId( "mock-data-tab" ) ).toBeTruthy();
  } );

  it( "renders observed date of observation in header", async ( ) => {
    mockObsEditProviderWithObs( [mockObservation] );
    renderObsDetails( );
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
      mockObsEditProviderWithObs( [mockObservation] );
      renderObsDetails( );

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
      mockObsEditProviderWithObs( [mockObservation] );
      renderObsDetails( );
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
      mockObsEditProviderWithObs( [mockObservation] );
      renderObsDetails( );
      const labelText = t( "Observation-photos-unavailable-without-internet" );
      const noInternet = await screen.findByLabelText( labelText );
      expect( noInternet ).toBeTruthy();
      expect( screen.queryByTestId( "PhotoScroll.photo" ) ).toBeNull();
    } );
  } );

  describe( "viewing own observation", ( ) => {
    async function expectEditAndNotMenu( ) {
      renderObsDetails( );
      const editLabelText = t( "Edit" );
      const editButton = await screen.findByLabelText( editLabelText );
      expect( editButton ).toBeTruthy( );
      const kebabMenuLabelText = t( "Observation-options" );
      const kebabMenu = screen.queryByLabelText( kebabMenuLabelText );
      expect( kebabMenu ).toBeFalsy( );
    }

    it( "should show the edit button and not the menu", async ( ) => {
      const mockOwnObservation = factory( "LocalObservation", { user: mockUser } );
      mockObsEditProviderWithObs( [mockOwnObservation] );
      useLocalObservation.mockImplementation( ( ) => mockOwnObservation );
      expect( mockOwnObservation.user.id ).toEqual( mockUser.id );
      await expectEditAndNotMenu( );
    } );

    it(
      "should show the edit button and not the menu when the observation has never been uploaded",
      async ( ) => {
        const observation = factory.states( "unUploaded" )( "LocalObservation" );
        mockObsEditProviderWithObs( [observation] );
        useLocalObservation.mockImplementation( ( ) => observation );
        // An unuploaded observation *should* be the only situation where an
        // observation has no user, b/c a user can make observations before
        // signing in
        expect( observation.user ).toBeFalsy( );
        await expectEditAndNotMenu( );
      }
    );
  } );

  describe( "viewing someone else's observation", ( ) => {
    it( "should show the menu and not the edit button", async ( ) => {
      expect( mockObservation.user.id ).not.toEqual( mockUser.id );
      mockObsEditProviderWithObs( [mockObservation] );
      useLocalObservation.mockImplementation( ( ) => mockObservation );
      renderObsDetails( );
      expect( await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` ) ).toBeTruthy( );
      const kebabMenuLabelText = t( "Observation-options" );
      const kebabMenu = await screen.findByLabelText( kebabMenuLabelText );
      expect( kebabMenu ).toBeTruthy( );
      const editLabelText = t( "Edit" );
      const editButton = screen.queryByLabelText( editLabelText );
      expect( editButton ).toBeFalsy( );
    } );
  } );
} );
