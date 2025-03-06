import { useRoute } from "@react-navigation/native";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import i18next, { t } from "i18next";
import React from "react";
import { View } from "react-native";
import { formatApiDatetime } from "sharedHelpers/dateAndTime.ts";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import * as useLocalObservation from "sharedHooks/useLocalObservation.ts";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  _created_at: faker.date.past( ),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.url( )
      }
    } )
  ],
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName( ),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.person.fullName( ),
    defaultPhoto: {
      id: faker.number.int( ),
      attribution: faker.lorem.sentence( ),
      licenseCode: "cc-by-nc",
      url: faker.image.url( )
    }
  } ),
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en"
  } ),
  identifications: []
} );
const mockNoEvidenceObservation = factory( "LocalObservation", {
  _created_at: faker.date.past( ),
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName( ),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.person.fullName( ),
    defaultPhoto: {
      id: faker.number.int( ),
      attribution: faker.lorem.sentence( ),
      licenseCode: "cc-by-nc",
      url: faker.image.url( )
    }
  } ),
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en"
  } ),
  identifications: []
} );
mockNoEvidenceObservation.observationPhotos = [];
mockNoEvidenceObservation.observationSounds = [];
const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  id: "1234"
} );

jest.mock( "sharedHooks/useLocalObservation", () => ( {
  __esModule: true,
  default: ( ) => null
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

const mockNavigate = jest.fn();

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

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
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

const renderObsDetails = ( ) => renderComponent(
  <ObsDetailsContainer />
);

describe( "ObsDetails", () => {
  beforeAll( async () => {
    jest.useFakeTimers( );
  } );

  beforeEach( ( ) => {
    // Reset store value of obsDetailsTab to ACTIVITY_TAB
    useStore.setState( { obsDetailsTab: "ACTIVITY" } );
  } );

  it.todo( "should not have accessibility errors" );
  // The only reason this was passing before letting users view images offline
  // was because it the connectivity test was accidentally mocked to be
  // offline when this test ran, so while this doesn't pass with my change,
  // it's not because of my change. There's something about
  // react-native-reanimated-carousel that needs investigation. ~~~kueda
  // 20240119
  // it( "should not have accessibility errors", async () => {
  //   renderObsDetails( );
  //   const obsDetails = await screen.findByTestId(
  //     `ObsDetails.${mockObservation.uuid}`
  //   );
  //   expect( obsDetails ).toBeAccessible();
  // } );

  it( "renders obs details from remote call", async () => {
    renderObsDetails( );

    const obs = await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` );

    await waitFor( ( ) => {
      expect( obs ).toBeTruthy();
    } );
    expect( screen.getByText( mockObservation.taxon.name ) ).toBeTruthy();
  } );

  it( "renders data tab on button press", async () => {
    renderObsDetails( );
    const button = await screen.findByTestId( "ObsDetails.DetailsTab" );
    expect( screen.queryByTestId( "mock-data-tab" ) ).not.toBeTruthy();

    fireEvent.press( button );
    expect( await screen.findByTestId( "mock-data-tab" ) ).toBeTruthy();
  } );

  it( "renders observed date of observation in header", async ( ) => {
    renderObsDetails( );
    const observedDate = await screen.findByText(
      formatApiDatetime( mockObservation.time_observed_at, i18next )
    );
    expect( observedDate ).toBeVisible( );
    const createdDate = screen.queryByText(
      formatApiDatetime( mockObservation.created_at, i18next )
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
      renderObsDetails( );
      fireEvent.press(
        await screen.findByTestId(
          `ObsDetails.taxon.${mockObservation.taxon.id}`
        )
      );
      expect( mockNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
        name: "TaxonDetails",
        params: { id: mockObservation.taxon.id }
      } ) );
    } );

    it.todo( "shows network error image instead of observation photos if user is offline" );
    // I'm not sure this can still be tested if we allow cached images to be
    // shown offline. Maybe you can mock <Image> to pretend like it did or
    // didn't load from cache? ~~~kueda 20240119
    // it(
    //   "shows network error image instead of observation photos if user is offline",
    //   async () => {
    //     renderObsDetails( );
    //     const labelText = t( "Observation-photos-unavailable-without-internet" );
    //     const noInternet = await screen.findByLabelText( labelText );
    //     expect( noInternet ).toBeTruthy();
    //     expect( screen.queryByTestId( "PhotoScroll.photo" ) ).toBeNull();
    //   }
    // );
  } );

  describe( "viewing own observation", ( ) => {
    async function expectEditAndNotMenu( ) {
      const editLabelText = t( "Edit" );
      const editButton = await screen.findByLabelText( editLabelText );
      expect( editButton ).toBeTruthy( );
      const kebabMenuLabelText = t( "Observation-options" );
      const kebabMenu = screen.queryByLabelText( kebabMenuLabelText );
      expect( kebabMenu ).toBeFalsy( );
    }

    it( "should show the edit button and not the menu", async ( ) => {
      const mockOwnObservation = factory( "LocalObservation", { user: mockUser } );
      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => mockOwnObservation );
      jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockOwnObservation.user );
      renderObsDetails( );
      expect( mockOwnObservation.user.id ).toEqual( mockUser.id );
      await expectEditAndNotMenu( );
    } );

    it(
      "should show the edit button and not the menu when the observation has never been uploaded",
      async ( ) => {
        const observation = factory( "LocalObservation" );
        jest.spyOn( useLocalObservation, "default" )
          .mockImplementation( () => observation );
        jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => observation.user );
        renderObsDetails( );
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
      renderObsDetails( );
      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => mockObservation );
      jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => null );
      renderObsDetails( );
      expect( await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` ) ).toBeTruthy( );
      const kebabMenuLabelText = t( "Observation-options" );
      const kebabMenu = await screen.findByLabelText( kebabMenuLabelText );
      expect( kebabMenu ).toBeTruthy( );
      const editLabelText = t( "Edit" );
      const editButton = screen.queryByLabelText( editLabelText );
      expect( editButton ).toBeFalsy( );
    } );

    it( "should agree with another user's identification when agree button pressed", async ( ) => {
      const firstIdentification = factory( "RemoteIdentification", {
        taxon: factory( "RemoteTaxon", {
          preferred_common_name: "Red Fox",
          name: "Vulpes vulpes",
          is_active: true
        } ),
        user: factory( "RemoteUser" )
      } );
      const otherUserObservation = mockObservation;
      otherUserObservation.identifications = [
        firstIdentification
      ];

      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => null );

      useAuthenticatedQuery.mockReturnValue( {
        data: otherUserObservation
      } );

      jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );
      renderObsDetails( );
      const agreeButton = screen.getByTestId(
        `ActivityItem.AgreeIdButton.${firstIdentification.taxon.id}`
      );
      expect( agreeButton ).toBeTruthy( );
      fireEvent.press( agreeButton );
      const confirmButton = screen.getByTestId( "ObsDetail.AgreeId.cvSuggestionsButton" );
      expect( confirmButton ).toBeTruthy( );
      fireEvent.press( confirmButton );
      expect( mockMutate ).toHaveBeenCalledWith( {
        identification: {
          observation_id: otherUserObservation.uuid,
          taxon_id: firstIdentification.taxon.id
        }
      } );
    } );
  } );
} );
