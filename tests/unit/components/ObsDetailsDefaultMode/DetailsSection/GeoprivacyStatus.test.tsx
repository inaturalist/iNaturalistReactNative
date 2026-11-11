import { render, screen } from "@testing-library/react-native";
import GeoprivacyStatus from "components/ObsDetailsDefaultMode/DetailsSection/GeoprivacyStatus";
import React from "react";
import {
  GEOPRIVACY_OBSCURED,
  GEOPRIVACY_OPEN,
  GEOPRIVACY_PRIVATE,
} from "realmModels/geoprivacy";

describe( "GeoprivacyStatus", ( ) => {
  it( "shows obscured geoprivacy", ( ) => {
    render( <GeoprivacyStatus geoprivacy={GEOPRIVACY_OBSCURED} /> );

    expect( screen.getByText( "Geoprivacy: Obscured" ) ).toBeVisible( );
  } );

  it( "shows private geoprivacy", ( ) => {
    render( <GeoprivacyStatus geoprivacy={GEOPRIVACY_PRIVATE} /> );

    expect( screen.getByText( "Geoprivacy: Private" ) ).toBeVisible( );
  } );

  it.each( [
    ["open", GEOPRIVACY_OPEN],
    ["missing", undefined],
    ["unset", null],
  ] as const )( "shows open geoprivacy when the value is %s", ( _label, geoprivacy ) => {
    render( <GeoprivacyStatus geoprivacy={geoprivacy} /> );

    expect( screen.getByText( "Geoprivacy: Open" ) ).toBeVisible( );
  } );
} );
