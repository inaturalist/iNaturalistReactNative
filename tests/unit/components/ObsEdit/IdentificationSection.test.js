import { screen } from "@testing-library/react-native";
import IdentificationSection from "components/ObsEdit/IdentificationSection";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const renderIdentificationSection = obs => renderComponent(
  <IdentificationSection
    passesIdentificationTest
    observations={obs}
    currentObservation={obs[0]}
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
    const observations = [
      factory( "RemoteObservation", {
        taxon: {
          name: "Fungi",
          isIconic: true,
          iconic_taxon_name: "Fungi"
        }
      } )
    ];
    renderIdentificationSection( observations );
    expect( screen.getByTestId( "ObsEdit.Suggestions" ) ).toBeVisible( );
  } );

  it( "should hide IconicTaxonChooser when a non-iconic taxon is selected", ( ) => {
    const observations = [
      factory( "RemoteObservation", {
        taxon: {
          name: "Fox Squirrel",
          iconic_taxon_name: null
        }
      } )
    ];
    renderIdentificationSection( observations );
    expect( screen.queryByTestId( "ObsEdit.Suggestions" ) ).toBeFalsy( );
  } );
} );
