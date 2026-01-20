import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetailsSharedComponents/ActivityTab/ActivityItem";
import i18next from "i18next";
import React from "react";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "LocalTaxon" );
const mockIdentification = factory( "LocalIdentification", {
  uuid: "123456789",
  user: factory( "LocalUser" ),
  taxon: mockTaxon,
} );

const mockIdentificationWithHiddenContent = {
  ...mockIdentification,
  hidden: true,
};

describe( "ActivityItem", () => {
  it( "renders name of identification taxon", async ( ) => {
    renderComponent(
      <ActivityItem
        item={mockIdentification}
        key={mockIdentification.uuid}
      />,
    );
    const accessibleName = accessibleTaxonName( mockTaxon, null, i18next.t );
    const navToTaxonDetailsLabel = screen.getByLabelText( accessibleName );
    expect( navToTaxonDetailsLabel ).toBeTruthy( );
  } );

  it( "renders agree button if user is logged in", async ( ) => {
    renderComponent(
      <ActivityItem
        currentUserId="000"
        isFirstDisplay
        item={mockIdentification}
        key={mockIdentification.uuid}
        openAgreeWithIdSheet={jest.fn()}
        userAgreedId=""
      />,
    );
    const agreeButton = await screen.findByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`,
    );
    await waitFor( ( ) => {
      expect( agreeButton ).toBeTruthy( );
    } );
  } );

  it( "does not render agree button if user is logged out", async ( ) => {
    renderComponent(
      <ActivityItem
        currentUserId={undefined}
        isFirstDisplay
        item={mockIdentification}
        key={mockIdentification.uuid}
        openAgreeWithIdSheet={jest.fn()}
        userAgreedId=""
      />,
    );
    const agreeButton = screen.queryByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`,
    );
    await waitFor( ( ) => {
      expect( agreeButton ).toBeFalsy( );
    } );
  } );

  it( "does not render agree button on second taxon display", async ( ) => {
    renderComponent(
      <ActivityItem
        currentUserId="000"
        isFirstDisplay={false}
        item={mockIdentification}
      />,
    );
    const agreeButton = screen.queryByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`,
    );
    await waitFor( ( ) => {
      expect( agreeButton ).toBeFalsy( );
    } );
  } );

  it( "shows agree sheet with correct taxon", async ( ) => {
    const mockopenAgreeWithIdSheet = jest.fn();
    renderComponent(
      <ActivityItem
        currentUserId="000"
        isFirstDisplay
        item={mockIdentification}
        openAgreeWithIdSheet={mockopenAgreeWithIdSheet}
      />,
    );
    const agreeButton = await screen.findByTestId(
      `ActivityItem.AgreeIdButton.${mockIdentification.taxon.id}`,
    );
    fireEvent.press( agreeButton );
    expect( mockopenAgreeWithIdSheet ).toHaveBeenCalledWith( mockIdentification.taxon );
  } );

  it( "renders withdrawn id label", async ( ) => {
    const mockId = factory( "LocalIdentification", {
      uuid: "123456789",
      user: factory( "LocalUser" ),
      taxon: factory( "LocalTaxon", {
        name: "Miner's Lettuce",
      } ),
      current: false,
    } );
    renderComponent(
      <ActivityItem
        currentUserId="000"
        item={mockId}
        key={mockId.uuid}
        userAgreedId=""
      />,
    );

    const idWithdrawn = await screen.findByText( "ID Withdrawn" );
    await waitFor( ( ) => {
      expect( idWithdrawn ).toBeTruthy( );
    } );
  } );

  it( "should not show hidden content", async ( ) => {
    renderComponent(
      <ActivityItem
        currentUserId="000"
        item={mockIdentificationWithHiddenContent}
      />,
    );
    const activityItem = screen.queryByTestId( "ObsDetails.ActivityItem" );
    expect( activityItem ).toBeFalsy( );
  } );

  it( "should show unhidden content", async ( ) => {
    renderComponent(
      <ActivityItem
        currentUserId="000"
        item={mockIdentification}
      />,
    );
    const activityItem = screen.queryByTestId( "ObsDetails.ActivityItem" );
    expect( activityItem ).toBeVisible( );
  } );
} );
