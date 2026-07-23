import { screen, userEvent } from "@testing-library/react-native";
import DefaultSearchOptions
  from "components/Explore/ExploreV2/components/DefaultSearchOptions";
import initI18next from "i18n/initI18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

// Stub the iconic chooser so we can trigger onTaxonChosen directly, sidestepping
// the horizontal FlatList's virtualization (the real "unknown" chip is the last
// item and is not rendered in the initial test window). The chooser's own
// inclusion/`withoutUnknown` behavior is covered by its dedicated test.
jest.mock( "components/SharedComponents/IconicTaxonChooser", ( ) => {
  const MockReact = require( "react" );
  const { Pressable, Text } = require( "react-native" );
  return {
    __esModule: true,
    default: jest.fn( ( { onTaxonChosen, withoutUnknown } ) => (
      MockReact.createElement(
        MockReact.Fragment,
        null,
        MockReact.createElement(
          Pressable,
          { testID: "mockIconic.unknown", onPress: ( ) => onTaxonChosen( "unknown" ) },
          MockReact.createElement( Text, null, "unknown" ),
        ),
        MockReact.createElement(
          Pressable,
          { testID: "mockIconic.plantae", onPress: ( ) => onTaxonChosen( "plantae" ) },
          MockReact.createElement( Text, null, "plantae" ),
        ),
        MockReact.createElement(
          Text,
          { testID: "mockIconic.withoutUnknown" },
          String( !!withoutUnknown ),
        ),
      )
    ) ),
  };
} );
const IconicTaxonChooser = require( "components/SharedComponents/IconicTaxonChooser" ).default;

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( { __esModule: true, default: jest.fn( ) } ) );
const useCurrentUser = require( "sharedHooks/useCurrentUser" ).default;

jest.mock( "sharedHooks/useIconicTaxa", ( ) => ( { __esModule: true, default: jest.fn( ) } ) );
const useIconicTaxa = require( "sharedHooks/useIconicTaxa" ).default;

const ICONIC_TAXA = [
  {
    id: 47126,
    name: "Plantae",
    iconic_taxon_name: "Plantae",
    preferred_common_name: "Plants",
  },
];

const actor = userEvent.setup( );

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  IconicTaxonChooser.mockClear( );
  useCurrentUser.mockReturnValue( null );
  useIconicTaxa.mockReturnValue( ICONIC_TAXA );
} );

describe( "DefaultSearchOptions", ( ) => {
  it( "offers the Unknown option (does not hide it from the iconic chooser)", ( ) => {
    renderComponent( <DefaultSearchOptions onSelectSubject={jest.fn( )} /> );

    // withoutUnknown must not be set, so the chooser includes the "unknown" chip
    expect( screen.getByTestId( "mockIconic.withoutUnknown" ) ).toHaveTextContent( "false" );
  } );

  it( "selects an unknown subject when the Unknown chip is chosen", async ( ) => {
    const onSelectSubject = jest.fn( );
    renderComponent( <DefaultSearchOptions onSelectSubject={onSelectSubject} /> );

    await actor.press( screen.getByTestId( "mockIconic.unknown" ) );

    expect( onSelectSubject ).toHaveBeenCalledWith( { type: "unknown" } );
  } );

  it( "still resolves a real iconic taxon to a taxon subject", async ( ) => {
    const onSelectSubject = jest.fn( );
    renderComponent( <DefaultSearchOptions onSelectSubject={onSelectSubject} /> );

    await actor.press( screen.getByTestId( "mockIconic.plantae" ) );

    expect( onSelectSubject ).toHaveBeenCalledWith(
      expect.objectContaining( {
        type: "taxon",
        taxon: expect.objectContaining( { id: 47126, name: "Plantae" } ),
      } ),
    );
  } );
} );
