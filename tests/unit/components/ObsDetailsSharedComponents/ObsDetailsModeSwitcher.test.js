import { useRoute } from "@react-navigation/native";
import { fireEvent, screen } from "@testing-library/react-native";
import ObsDetailsModeSwitcher from "components/ObsDetailsSharedComponents/ObsDetailsModeSwitcher";
import i18next from "i18next";
import React from "react";
import { View } from "react-native";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";

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
        url: faker.image.url( ),
      },
    } ),
  ],
  taxon: factory( "LocalTaxon", {
    id: faker.number.int( ),
    name: faker.person.firstName( ),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.person.fullName( ),
    defaultPhoto: {
      id: faker.number.int( ),
      attribution: faker.lorem.sentence( ),
      licenseCode: "cc-by-nc",
      url: faker.image.url( ),
    },
  } ),
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en",
  } ),
  identifications: [],
} );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  id: "1234",
} );

const mockNavigate = jest.fn();

useRoute.mockImplementation( ( ) => ( {
  key: "obs-details-route",
  params: { uuid: mockObservation.uuid },
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
      canGoBack: jest.fn(),
    } ),
  };
} );

const mockDataTab = <View testID="mock-data-tab" />;
jest.mock( "components/ObsDetails/DetailsTab/DetailsTab", () => ( {
  __esModule: true,
  default: () => mockDataTab,
} ) );

jest.mock(
  "components/SharedComponents/ScrollViewWrapper",
  () => function MockContainer( props ) {
    const MockName = "mock-scroll-with-footer";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  },
);

const defaultProps = {
  activityItems: [],
  addingActivityItem: false,
  belongsToCurrentUser: false,
  currentUser: mockUser,
  isConnected: true,
  navToSuggestions: jest.fn(),
  observation: mockObservation,
  openAddCommentSheet: jest.fn(),
  openAgreeWithIdSheet: jest.fn(),
  refetchRemoteObservation: jest.fn(),
  refetchSubscriptions: jest.fn(),
  showAddCommentSheet: jest.fn(),
  subscriptions: {},
  wasSynced: true,
  uuid: mockObservation.uuid,
};

const renderModeSwitcher = ( props = {} ) => renderComponent(
  <ObsDetailsModeSwitcher {...defaultProps} {...props} />,
);

describe( "ObsDetailsModeSwitcher", () => {
  beforeAll( () => {
    jest.useFakeTimers( );
  } );

  beforeEach( () => {
    setStoreStateLayout( { isDefaultMode: false } );
    useStore.setState( { obsDetailsTab: "ACTIVITY" } );
  } );

  it.todo( "should not have accessibility errors" );

  it( "renders data tab on button press", async () => {
    renderModeSwitcher( );
    const button = await screen.findByTestId( "ObsDetails.DetailsTab" );
    expect( screen.queryByTestId( "mock-data-tab" ) ).not.toBeTruthy();

    fireEvent.press( button );
    expect( await screen.findByTestId( "mock-data-tab" ) ).toBeTruthy();
  } );

  it( "renders observed date of observation in header", async () => {
    renderModeSwitcher( );
    const observedDate = await screen.findByText(
      formatApiDatetime( mockObservation.time_observed_at, i18next ),
    );
    expect( observedDate ).toBeVisible( );
    const createdDate = screen.queryByText(
      formatApiDatetime( mockObservation.created_at, i18next ),
    );
    expect( createdDate ).toBeFalsy( );
  } );

  describe( "activity tab", () => {
    it( "navigates to taxon details on button press", async () => {
      renderModeSwitcher( );
      fireEvent.press(
        await screen.findByTestId(
          `ObsDetails.taxon.${mockObservation.taxon.id}`,
        ),
      );
      expect( mockNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
        name: "TaxonDetails",
        params: { id: mockObservation.taxon.id },
      } ) );
    } );

    it.todo( "shows network error image instead of observation photos if user is offline" );
  } );
} );
