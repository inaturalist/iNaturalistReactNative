import { faker } from "@faker-js/faker";
import { fireEvent, screen } from "@testing-library/react-native";
import ActivityHeader from "components/ObsDetails/ActivityTab/ActivityHeader";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

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

describe( "ActivityHeaderKebabMenu", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "renders kebab menu buttons", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: mockUser,
      category: "Identification",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } ),
      current: true
    } );
    renderComponent(
      <ActivityHeader
        item={mockId}
        currentUser
        idWithdrawn={false}
        flagged={false}
        updateCommentBody={jest.fn()}
        deleteComment={jest.fn()}
        withdrawOrRestoreIdentification={jest.fn()}
        onItemFlagged={jest.fn()}
      />
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  } );

  it( "renders correct kebab menu for non-withdrawn id from current user", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: mockUser,
      category: "Identification",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } ),
      current: true
    } );
    renderComponent(
      <ActivityHeader
        item={mockId}
        currentUser
        idWithdrawn={false}
        flagged={false}
        updateCommentBody={jest.fn()}
        deleteComment={jest.fn()}
        withdrawOrRestoreIdentification={jest.fn()}
        onItemFlagged={jest.fn()}
      />
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    expect( await screen.findByText( "Withdraw" ) ).toBeTruthy( );
  } );

  it( "renders correct kebab menu for withdrawn id from current user", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: mockUser,
      category: "Identification",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } ),
      current: false
    } );
    renderComponent(
      <ActivityHeader
        item={mockId}
        currentUser
        idWithdrawn={false}
        flagged={false}
        updateCommentBody={jest.fn()}
        deleteComment={jest.fn()}
        withdrawOrRestoreIdentification={jest.fn()}
        onItemFlagged={jest.fn()}
      />
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    expect( await screen.findByText( "Restore" ) ).toBeTruthy( );
  } );

  it( "renders correct kebab menu for comment from current user", async ( ) => {
    const mockId = factory( "LocalComment", {
      body: "hello",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } )
    } );
    renderComponent(
      <ActivityHeader
        item={mockId}
        currentUser
        idWithdrawn={false}
        flagged={false}
        updateCommentBody={jest.fn()}
        deleteComment={jest.fn()}
        withdrawOrRestoreIdentification={jest.fn()}
        onItemFlagged={jest.fn()}
      />
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    expect( await screen.findByText( t( "Edit-comment" ) ) ).toBeTruthy( );
    expect( await screen.findByText( t( "Edit-comment" ) ) ).toBeTruthy( );
  } );
  it( "renders WithdrawIDSheet when withdraw is pressed", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: mockUser,
      category: "Identification",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } ),
      current: true
    } );
    renderComponent(
      <ActivityHeader
        item={mockId}
        currentUser
        idWithdrawn={false}
        flagged={false}
        updateCommentBody={jest.fn()}
        deleteComment={jest.fn()}
        withdrawOrRestoreIdentification={jest.fn()}
        onItemFlagged={jest.fn()}
      />
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    fireEvent.press( await screen.findByText( t( "Withdraw" ) ) );
    expect( await screen.findByText( t( "WITHDRAW-ID-QUESTION" ) ) ).toBeTruthy( );
  } );

  it( "renders delete comment sheet when delete comment is pressed", async ( ) => {
    const mockId = factory( "LocalComment", {
      body: "hello",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce"
      } )
    } );
    renderComponent(
      <ActivityHeader
        item={mockId}
        currentUser
        idWithdrawn={false}
        flagged={false}
        updateCommentBody={jest.fn()}
        deleteComment={jest.fn()}
        withdrawOrRestoreIdentification={jest.fn()}
        onItemFlagged={jest.fn()}
      />
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    fireEvent.press( await screen.findByText( t( "Delete-comment" ) ) );
    expect( await screen.findByText( t( "DELETE-COMMENT-QUESTION" ) ) ).toBeTruthy( );
  } );
} );
