import { screen, waitFor } from "@testing-library/react-native";
import ActivityItem from "components/ObsDetails/ActivityTab/ActivityItem";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockIdentification = factory( "LocalIdentification", {
  uuid: "123456789",
  user: factory( "LocalUser" ),
  taxon: factory( "LocalTaxon", {
    name: "Miner's Lettuce",
    rank_level: 10
  } )
} );

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
    const agreeButton = await screen.findByTestId( "ActivityItem.AgreeIdButton" );
    await waitFor( ( ) => {
      expect( agreeButton ).toBeTruthy( );
    } );
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

    const idWithdrawn = await screen.findByText( "ID Withdrawn" );
    await waitFor( ( ) => {
      expect( idWithdrawn ).toBeTruthy( );
    } );
  } );
} );
