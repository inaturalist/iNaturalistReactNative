import { useNetInfo } from "@react-native-community/netinfo";
import { act, screen, userEvent } from "@testing-library/react-native";
import SavedMatchContainer from "components/ObsDetailsDefaultMode/SavedMatch/SavedMatchContainer";
import { t } from "i18next";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { describe } from "yargs";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

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

const mockPush = jest.fn();
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      push: mockPush,
      setOptions: jest.fn()
    } )
  };
} );

/*
  beforeEach( async ( ) => {
    jest.clearAllMocks( );
  } ); */

describe( "SavedMatch", ( ) => {
  describe( "SavedMatch goto taxon", ( ) => {
    it( "should call navigation.push on learn more button press", async ( ) => {
      const actor = userEvent.setup( );
      renderAppWithComponent( <SavedMatchContainer observation={mockObservation} /> );
      const learnMoreButton = await screen.findByText( t( "LEARN-MORE-ABOUT-THIS-SPECIES" ) );
      await act( async ( ) => actor.press( learnMoreButton ) );
      expect( mockPush ).toHaveBeenCalledWith( "TaxonDetails", {
        id: mockObservation.taxon.id
      } );
    } );

    it( "should not show learn more button when offline", async ( ) => {
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      renderAppWithComponent( <SavedMatchContainer observation={mockObservation} /> );
      const learnMoreButton = screen.queryByText( t( "LEARN-MORE-ABOUT-THIS-SPECIES" ) );
      expect( learnMoreButton ).toBeFalsy( );
    } );
  } );
} );
