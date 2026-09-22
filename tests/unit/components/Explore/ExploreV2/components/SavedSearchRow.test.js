import { fireEvent, screen, userEvent } from "@testing-library/react-native";
import SavedSearchRow from "components/Explore/ExploreV2/components/SavedSearchRow";
import initI18next from "i18n/initI18next";
import { defaultExploreV2Filters, EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React from "react";
import { renderComponent } from "tests/helpers/render";
import { savedSearch as buildSavedSearch } from "tests/helpers/savedSearch";

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { id: 99, login: "tester", prefers_common_names: true } ),
} ) );

const TAXON_SUBJECT = {
  type: "taxon",
  taxon: {
    id: 12,
    name: "Opuntia fragilis",
    preferred_common_name: "Brittle Pricklypear",
    iconic_taxon_name: "Plantae",
    default_photo: { url: "https://example.com/t.jpg" },
  },
};

// A richer taxon than the shared factory's, so the row's common name and photo have something
// to render
const savedSearch = ( overrides = {} ) => buildSavedSearch( {
  subject: TAXON_SUBJECT,
  location: {
    placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
    place: { id: 1, display_name: "Minnesota, US", place_type: 9 },
  },
  ...overrides,
} );

const renderRow = ( search, handlers = {} ) => renderComponent(
  <SavedSearchRow
    onDelete={handlers.onDelete || jest.fn( )}
    onPress={handlers.onPress || jest.fn( )}
    search={search}
  />,
);

beforeAll( async ( ) => {
  await initI18next( );
} );

describe( "SavedSearchRow", ( ) => {
  it( "shows what was searched for, where, and how many filters narrowed it", async ( ) => {
    renderRow( savedSearch( {
      filters: { ...defaultExploreV2Filters, casual: true, media: "photos" },
    } ) );

    expect( await screen.findByText( "Brittle Pricklypear" ) ).toBeVisible( );
    expect( screen.getByText( "Minnesota, US" ) ).toBeVisible( );
    expect( screen.getByText( /2 filters/ ) ).toBeVisible( );
  } );

  it( "says nothing about filters when the search has none", async ( ) => {
    renderRow( savedSearch( ) );

    expect( await screen.findByText( "Minnesota, US" ) ).toBeVisible( );
    expect( screen.queryByText( /filters/ ) ).toBeNull( );
  } );

  it( "falls back to the placeholder for a search with no subject", async ( ) => {
    renderRow( savedSearch( { subject: null } ) );

    expect( await screen.findByText( "All organisms" ) ).toBeVisible( );
    expect( screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeVisible( );
  } );

  it( "labels a search for unobserved species", async ( ) => {
    renderRow( savedSearch( {
      subject: { type: "unobserved", user: { id: 7, login: "tester" } },
    } ) );

    expect( await screen.findByText( "Unobserved" ) ).toBeVisible( );
  } );

  it( "applies the search when the row is tapped", async ( ) => {
    const onPress = jest.fn( );
    renderRow( savedSearch( ), { onPress } );
    const actor = userEvent.setup( );

    await actor.press( await screen.findByLabelText( "Opuntia fragilis, Minnesota, US" ) );

    expect( onPress ).toHaveBeenCalled( );
  } );

  it( "offers delete as an accessibility action, since a swipe is not reachable", async ( ) => {
    const onDelete = jest.fn( );
    renderRow( savedSearch( ), { onDelete } );

    fireEvent(
      await screen.findByLabelText( "Opuntia fragilis, Minnesota, US" ),
      "accessibilityAction",
      { nativeEvent: { actionName: "delete" } },
    );

    expect( onDelete ).toHaveBeenCalled( );
  } );
} );
