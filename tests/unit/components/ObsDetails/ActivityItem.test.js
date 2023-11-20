import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetails/ActivityTab/ActivityItem";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockIdentification = factory( "LocalIdentification", {
  uuid: "123456789",
  user: factory( "LocalUser" ),
  taxon: factory( "LocalTaxon", {
    name: "Miner's Lettuce",
    rank_level: 10
  } )
} );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  comments: [
    factory( "LocalComment" ),
    factory( "LocalComment" ),
    factory( "LocalComment" )
  ],
  identifications: [
    factory( "LocalIdentification" ),
    factory( "LocalIdentification" )
  ]
} );

const mockUser = factory( "LocalUser", {
  id: 0,
  login: faker.internet.userName( ),
  iconUrl: faker.image.imageUrl( )
} );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockUser.id,
  isCurrentUser: ( ) => true
} ) );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

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
      navigate: jest.fn(),
      addListener: jest.fn(),
      setOptions: jest.fn()
    } )
  };
} );

jest.mock( "components/SharedComponents/DisplayTaxonName" );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: mockMutate
  } )
} ) );

describe( "ActivityItem", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );
  it( "renders", async ( ) => {
    renderComponent(
      <ActivityItem
        userAgreedId=""
        key={mockIdentification.uuid}
        observationUUID=""
        item={mockIdentification}
        navToTaxonDetails={jest.fn()}
        refetchRemoteObservation={jest.fn()}
        onAgree={jest.fn()}
        currentUserId="000"
      />
    );
    expect( await screen.findByTestId( "ActivityItem.AgreeIdButton" ) ).toBeTruthy( );
  } );

  it( "renders agree with id button for correct id", async ( ) => {
    renderComponent(
      <ActivityItem
        userAgreedId=""
        key={mockIdentification.uuid}
        observationUUID=""
        item={mockIdentification}
        navToTaxonDetails={jest.fn()}
        refetchRemoteObservation={jest.fn()}
        onAgree={jest.fn()}
        currentUserId="000"
      />
    );
    expect( await screen.findByTestId( "ActivityItem.AgreeIdButton" ) ).toBeTruthy( );
  } );

  it( "renders withdrawn id label", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: factory( "LocalUser" ),
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } ),
      current: false
    } );
    renderComponent(
      <ActivityItem
        userAgreedId=""
        key={mockId.uuid}
        observationUUID=""
        item={mockId}
        navToTaxonDetails={jest.fn()}
        refetchRemoteObservation={jest.fn()}
        onAgree={jest.fn()}
        currentUserId="000"
      />
    );

    expect( await screen.findByText( "ID Withdrawn" ) ).toBeTruthy( );
  } );
} );
