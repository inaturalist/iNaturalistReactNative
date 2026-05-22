import { useRoute } from "@react-navigation/native";
import { screen } from "@testing-library/react-native";
import ObsDetailsScreen from "components/ObsDetailsSharedComponents/ObsDetailsScreen";
import React from "react";
import * as useLocalObservation from "sharedHooks/useLocalObservation";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockUuid = "test-123";

const mockCurrentUser = factory( "LocalUser", {
  id: 123,
  login: faker.internet.userName( ),
} );

const mockLocalObservation = factory( "LocalObservation", {
  user: factory( "LocalUser", {
    id: 123,
  } ),
  uuid: mockUuid,
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName( ),
    rank: "species",
    rank_level: 10,
  } ),
} );

jest.mock( "@react-native-community/netinfo", () => ( {
  useNetInfo: () => ( { isConnected: true } ),
  configure: jest.fn( ),
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockCurrentUser,
} ) );

jest.mock( "sharedHooks/useLocalObservation", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    localObservation: null,
  } ) ),
} ) );

jest.mock( "sharedHooks/useRemoteObservation", ( ) => ( {
  __esModule: true,
  default: ( _uuid, _fetchRemoteEnabled ) => ( {
    remoteObservation: null,
    refetchRemoteObservation: jest.fn( ),
    isRefetching: false,
    fetchRemoteObservationError: null,
  } ),
} ) );

useRoute.mockImplementation( ( ) => ( {
  params: { uuid: mockUuid },
} ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ),
    useNavigation: () => ( {
      navigate: jest.fn(),
      addListener: jest.fn(),
      setOptions: jest.fn(),
      canGoBack: jest.fn(),
    } ),
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    data: null,
  } ) ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: jest.fn(),
  } ),
} ) );

jest.mock( "sharedHooks/useObservationsUpdates", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    refetch: jest.fn(),
  } ) ),
} ) );

describe( "ObsDetailsScreen", ( ) => {
  beforeAll( () => {
    jest.useFakeTimers( );
  } );

  describe( "when showSavedMatch is true", ( ) => {
    it(
      "renders SavedMatchContainer when observation belongs to current user and is not synced",
      ( ) => {
        const unsyncedLocalObservation = {
          ...mockLocalObservation,
          wasSynced: jest.fn( () => false ),
        };

        jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
          localObservation: unsyncedLocalObservation,
          markDeletedLocally: jest.fn( ),
          markViewedLocally: jest.fn( ),
        } ) );

        renderComponent( <ObsDetailsScreen /> );

        expect( screen.getByTestId( "SavedMatch.container" ) ).toBeTruthy( );
        expect( screen.queryByTestId( "ObsDetails.container" ) ).toBeFalsy( );
      },
    );

    it( "renders SavedMatchContainer when observation has no user and is not synced", ( ) => {
      const unsyncedLocalObservationNoUser = factory( "LocalObservation", {
        user: null,
        uuid: mockUuid,
        wasSynced: jest.fn( () => false ),
      } );

      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
        localObservation: unsyncedLocalObservationNoUser,
        markDeletedLocally: jest.fn( ),
        markViewedLocally: jest.fn( ),
      } ) );

      renderComponent( <ObsDetailsScreen /> );

      expect( screen.getByTestId( "SavedMatch.container" ) ).toBeTruthy( );
      expect( screen.queryByTestId( "ObsDetails.container" ) ).toBeFalsy( );
    } );
  } );

  describe( "when showSavedMatch is false", ( ) => {
    it( "renders ObsDetailsContainer when observation is synced", ( ) => {
      const syncedLocalObservation = {
        ...mockLocalObservation,
        wasSynced: jest.fn( () => true ),
      };

      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
        localObservation: syncedLocalObservation,
        markDeletedLocally: jest.fn( ),
        markViewedLocally: jest.fn( ),
      } ) );

      renderComponent( <ObsDetailsScreen /> );

      expect( screen.getByTestId( "ObsDetails.container" ) ).toBeTruthy( );
      expect( screen.queryByTestId( "SavedMatch.container" ) ).toBeFalsy( );
    } );

    it(
      "renders ObsDetailsContainer when observation does not belong to current user",
      ( ) => {
        const otherUserObservation = factory( "LocalObservation", {
          user: factory( "LocalUser", {
            id: 456,
          } ),
          uuid: mockUuid,
          taxon: factory( "LocalTaxon", {
            name: faker.person.firstName( ),
            rank: "species",
            rank_level: 10,
          } ),
          wasSynced: jest.fn( () => false ),
        } );

        jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
          localObservation: otherUserObservation,
          markDeletedLocally: jest.fn( ),
          markViewedLocally: jest.fn( ),
        } ) );

        renderComponent( <ObsDetailsScreen /> );

        expect( screen.getByTestId( "ObsDetails.container" ) ).toBeTruthy( );
        expect( screen.queryByTestId( "SavedMatch.container" ) ).toBeFalsy( );
      },
    );
  } );
} );
