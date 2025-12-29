import { fireEvent, screen } from "@testing-library/react-native";
import ActivityHeader from "components/ObsDetails/ActivityTab/ActivityHeader";
import { t } from "i18next";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "LocalUser", {
  id: 0,
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
} );

describe( "ActivityHeaderKebabMenu", () => {
  it( "renders kebab menu buttons", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: mockUser,
      category: "Identification",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce",
      } ),
      current: true,
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
      />,
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
  } );

  it( "renders correct kebab menu for non-withdrawn id from current user", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: mockUser,
      category: "Identification",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce",
      } ),
      current: true,
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
      />,
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
        name: "Miner's Lettuce",
      } ),
      current: false,
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
      />,
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    expect( await screen.findByText( "Restore" ) ).toBeTruthy( );
  } );

  it( "renders correct kebab menu for comment from current user", async ( ) => {
    const mockId = factory( "LocalComment", {
      body: "hello",
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce",
      } ),
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
      />,
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
        name: "Miner's Lettuce",
      } ),
      current: true,
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
      />,
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
        name: "Miner's Lettuce",
      } ),
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
      />,
    );

    expect( await screen.findByTestId( "KebabMenu.Button" ) ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "KebabMenu.Button" ) );
    fireEvent.press( await screen.findByText( t( "Delete-comment" ) ) );
    expect( await screen.findByText( t( "DELETE-COMMENT--question" ) ) ).toBeTruthy( );
  } );
} );
