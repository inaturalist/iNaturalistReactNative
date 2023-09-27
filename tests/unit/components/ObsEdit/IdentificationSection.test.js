import { screen } from "@testing-library/react-native";
import IdentificationSection from "components/ObsEdit/IdentificationSection";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

// jest.mock( "@react-navigation/native", ( ) => {
//   const actualNav = jest.requireActual( "@react-navigation/native" );
//   return {
//     ...actualNav,
//     useRoute: ( ) => ( {
//     } ),
//     useNavigation: ( ) => ( {
//       setOptions: jest.fn( )
//     } )
//   };
// } );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
jest.mock( "providers/ObsEditProvider" );
const mockObsEditProviderWithObs = obs => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <INatPaperProvider>
    <ObsEditContext.Provider value={{
      observations: obs,
      currentObservation: obs[0],
      setPassesIdentificationTest: jest.fn( )
    }}
    >
      {children}
    </ObsEditContext.Provider>
  </INatPaperProvider>
) );

const renderIdentificationSection = ( ) => renderComponent(
  <ObsEditProvider>
    <IdentificationSection />
  </ObsEditProvider>
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
    mockObsEditProviderWithObs( observations );
    renderIdentificationSection( );
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
    mockObsEditProviderWithObs( observations );
    renderIdentificationSection( );
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
    mockObsEditProviderWithObs( observations );
    renderIdentificationSection( );
    expect( screen.queryByTestId( "ObsEdit.Suggestions" ) ).toBeFalsy( );
  } );
} );
