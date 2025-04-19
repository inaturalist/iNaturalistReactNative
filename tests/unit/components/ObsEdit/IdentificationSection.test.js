import { screen } from "@testing-library/react-native";
import IdentificationSection from "components/ObsEdit/IdentificationSection";
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

const mockObservations = [firstObservation, secondObservation];

const renderIdentificationSection = ( obs, index = 0, resetState = false ) => renderComponent(
  <IdentificationSection
    currentObservation={obs[index]}
    observations={obs}
    resetState={resetState}
  />
);

describe( "IdentificationSection", () => {
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
