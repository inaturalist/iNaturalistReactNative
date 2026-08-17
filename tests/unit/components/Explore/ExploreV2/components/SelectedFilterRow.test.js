import { screen, userEvent } from "@testing-library/react-native";
import SelectedFilterRow
  from "components/Explore/ExploreV2/components/SelectedFilterRow";
import React from "react";
import { Text } from "react-native";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup( );

const CHILD_LABEL = "Amphibia";

const renderRow = ( props = {} ) => renderComponent(
  <SelectedFilterRow
    accessibilityLabel="Change taxon"
    onEdit={jest.fn( )}
    onRemove={jest.fn( )}
    removeAccessibilityLabel="Remove taxon filter"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    <Text>{CHILD_LABEL}</Text>
  </SelectedFilterRow>,
);

describe( "SelectedFilterRow", ( ) => {
  it( "renders its children next to edit and remove controls", ( ) => {
    renderRow( );

    expect( screen.getByText( CHILD_LABEL ) ).toBeVisible( );
    expect( screen.getByLabelText( "Change taxon" ) ).toBeVisible( );
    expect( screen.getByLabelText( "Remove taxon filter" ) ).toBeVisible( );
  } );

  it( "calls onEdit when the row is tapped", async ( ) => {
    const onEdit = jest.fn( );
    const onRemove = jest.fn( );
    renderRow( { onEdit, onRemove } );

    await actor.press( screen.getByLabelText( "Change taxon" ) );

    expect( onEdit ).toHaveBeenCalledTimes( 1 );
    expect( onRemove ).not.toHaveBeenCalled( );
  } );

  it( "calls onRemove when the remove button is tapped", async ( ) => {
    const onEdit = jest.fn( );
    const onRemove = jest.fn( );
    renderRow( { onEdit, onRemove } );

    await actor.press( screen.getByLabelText( "Remove taxon filter" ) );

    expect( onRemove ).toHaveBeenCalledTimes( 1 );
    expect( onEdit ).not.toHaveBeenCalled( );
  } );
} );
