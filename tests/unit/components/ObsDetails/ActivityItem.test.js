import { screen } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetails/ActivityItem";
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

const mockUser = factory( "LocalUser" );
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

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
      setOptions: jest.fn()
    } )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: () => null
  } )
} ) );

jest.mock( "components/SharedComponents/DisplayTaxonName" );

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
        toggleRefetch={jest.fn()}
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
        toggleRefetch={jest.fn()}
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
        toggleRefetch={jest.fn()}
        refetchRemoteObservation={jest.fn()}
        onAgree={jest.fn()}
        currentUserId="000"
      />
    );

    expect( await screen.findByText( "ID Withdrawn" ) ).toBeTruthy( );
  } );
} );
