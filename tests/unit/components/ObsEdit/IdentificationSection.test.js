import { screen } from "@testing-library/react-native";
import IdentificationSection from "components/ObsEdit/IdentificationSection";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const firstObservation = factory( "RemoteObservation", {
  taxon: {
    name: "Fungi",
    isIconic: true,
    iconic_taxon_name: "Fungi",
    id: 47170
  }
} );

const secondObservation = factory( "RemoteObservation", {
  taxon: {
    name: "Aves",
    isIconic: true,
    iconic_taxon_name: "Aves",
    id: 3
  }
} );

const nonIconicObservation = factory( "RemoteObservation", {
  taxon: {
    name: "Fox Squirrel",
    iconic_taxon_name: null
  }
} );

const mockObservations = [firstObservation, secondObservation];

const renderIdentificationSection = ( obs, index = 0, resetState = false ) => renderComponent(
  <IdentificationSection
    currentObservation={obs[index]}
    observations={obs}
    passesIdentificationTest
    resetState={resetState}
  />
);

describe( "IdentificationSection", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should show IconicTaxonChooser when there is no identification", ( ) => {
    const observations = [
      factory( "RemoteObservation", {
        taxon: null
      } )
    ];
    renderIdentificationSection( observations );
    expect( screen.getByTestId( "ObsEdit.Suggestions" ) ).toBeVisible( );
  } );

  it( "should show IconicTaxonChooser when an iconic taxon is selected", ( ) => {
    renderIdentificationSection( [firstObservation] );
    expect( screen.getByTestId( "ObsEdit.Suggestions" ) ).toBeVisible( );
  } );

  it( "should hide IconicTaxonChooser when a non-iconic taxon is selected", ( ) => {
    renderIdentificationSection( [nonIconicObservation] );
    expect( screen.queryByTestId( "ObsEdit.Suggestions" ) ).toBeFalsy( );
  } );

  it( "should show correct iconic taxon selection when navigating multiple observations", ( ) => {
    renderIdentificationSection( mockObservations );
    const fungiIcon = screen.getByTestId( "IconicTaxonButton.fungi" );
    expect( fungiIcon ).toHaveProp( "accessibilityState", { selected: true } );
    renderIdentificationSection( mockObservations, 1, true );
    const icon = screen.getByTestId( "IconicTaxonButton.fungi" );
    expect( icon ).toHaveProp( "accessibilityState", { selected: false } );
    const birdIcon = screen.getByTestId( "IconicTaxonButton.aves" );
    expect( birdIcon ).toHaveProp( "accessibilityState", { selected: true } );
  } );
} );
