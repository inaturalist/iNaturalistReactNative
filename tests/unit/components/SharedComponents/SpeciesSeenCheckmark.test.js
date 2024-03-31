import { render, screen } from "@testing-library/react-native";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import React from "react";
import { useAuthenticatedQuery } from "sharedHooks";

const mockTaxon = {
  id: 1,
  name: "Aves",
  preferred_common_name: "Birds",
  rank: "family",
  rank_level: 60
};

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    data: {
      total_results: 4
    }
  } ) )
} ) );

describe( "SpeciesSeenCheckmark", ( ) => {
  it( "should render checkmark if user has previously seen species", ( ) => {
    render(
      <SpeciesSeenCheckmark taxon={mockTaxon} />
    );
    const checkmark = screen.getByTestId( "SpeciesSeenCheckmark" );
    expect( checkmark ).toBeVisible( );
  } );

  it( "should not render checkmark if user has not seen species", ( ) => {
    useAuthenticatedQuery.mockReturnValue( {
      data: {
        total_results: 0
      }
    } );
    render(
      <SpeciesSeenCheckmark taxon={mockTaxon} />
    );
    const checkmark = screen.queryByTestId( "SpeciesSeenCheckmark" );
    expect( checkmark ).toBeFalsy( );
  } );
} );
