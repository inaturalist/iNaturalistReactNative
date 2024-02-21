import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetails/ActivityTab/ActivityItem";

import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockIdentification = factory( "LocalIdentification", {
  uuid: "123456789",
  user: factory( "LocalUser" ),
  taxon: factory( "LocalTaxon", {
    name: "Miner's Lettuce",
    rank_level: 10,
    is_active: true
  } )
} );

describe( "ActivityItem", () => {

  it( "renders", async ( ) => {
    renderComponent(
      <ActivityItem
        item={mockIdentification}
        key={mockIdentification.uuid}
      />
    );
    const navToTaxonDetailsLabel = screen.getByLabelText( /Navigate to taxon details/ );
    expect( navToTaxonDetailsLabel ).toBeTruthy( );
  } );

  it( "renders agree button", async ( ) => {
    renderComponent(
      <ActivityItem
        currentUserId="000"
        isFirstDisplay
        item={mockIdentification}
        key={mockIdentification.uuid}
        onIDAgreePressed={jest.fn()}
        userAgreedId=""
      />
    );
    const agreeButton = await screen.findByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`
    );
    await waitFor( ( ) => {
      expect( agreeButton ).toBeTruthy( );
    } );
  } );

  it( "does not render agree button on second taxon display", async ( ) => {
    renderComponent(
      <ActivityItem
        isFirstDisplay={false}
        item={mockIdentification}
      />
    );
    const agreeButton = screen.queryByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`
    );
    await waitFor( ( ) => {
      expect( agreeButton ).toBeFalsy( );
    } );
  } );

  it( "shows agree sheet with correct taxon", async ( ) => {
    const mockOnIDAgreePressed = jest.fn();
    renderComponent(
      <ActivityItem
        isFirstDisplay
        item={mockIdentification}
        onIDAgreePressed={mockOnIDAgreePressed}
      />
    );
    const agreeButton = await screen.findByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`
    );
    fireEvent.press( agreeButton );
    expect( mockOnIDAgreePressed ).toHaveBeenCalledWith( mockIdentification.taxon );
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
        currentUserId="000"
        item={mockId}
        key={mockId.uuid}
        userAgreedId=""
      />
    );

    const idWithdrawn = await screen.findByText( "ID Withdrawn" );
    await waitFor( ( ) => {
      expect( idWithdrawn ).toBeTruthy( );
    } );
  } );
} );
