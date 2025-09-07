import { useRoute } from "@react-navigation/native";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeContainer";
import { t } from "i18next";
import React from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import * as useCurrentUser from "sharedHooks/useCurrentUser";
import * as useLocalObservation from "sharedHooks/useLocalObservation";
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
  default: jest.fn( () => ( {
    localObservation: null
  } ) )
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

const renderObsDetails = ( ) => renderComponent(
  <ObsDetailsContainer />
);

describe( "ObsDetails", () => {
  beforeAll( async () => {
    jest.useFakeTimers( );
  } );

  it( "renders obs details from remote call", async () => {
    renderObsDetails( );

    const obs = await screen.findByTestId( `ObsDetails.${mockObservation.uuid}` );

    await waitFor( ( ) => {
      expect( obs ).toBeTruthy();
    } );
    expect( screen.getByText( mockObservation.taxon.name ) ).toBeTruthy();
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

  describe( "viewing someone else's observation", ( ) => {
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

      jest.spyOn( useLocalObservation, "default" ).mockImplementation( () => ( {
        localObservation: null
      } ) );

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
