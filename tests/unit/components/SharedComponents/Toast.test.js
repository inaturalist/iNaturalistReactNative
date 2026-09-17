import {
  act, fireEvent, render, screen,
} from "@testing-library/react-native";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import Toast from "components/SharedComponents/Toast";
import React from "react";
import { AccessibilityInfo } from "react-native";

const ONE_TOAST = 200 + 2000 + 200;

const advance = ms => act( ( ) => { jest.advanceTimersByTime( ms ); } );

describe( "Toast", ( ) => {
  beforeEach( ( ) => {
    jest.useFakeTimers( );
    jest.spyOn( AccessibilityInfo, "announceForAccessibility" ).mockImplementation( ( ) => {} );
  } );

  afterEach( ( ) => {
    jest.useRealTimers( );
    jest.restoreAllMocks( );
  } );

  it( "shows the text and announces it to screen readers", ( ) => {
    render( <Toast onHide={jest.fn( )} text="Added to Saved Searches" /> );

    expect( screen.getByText( "Added to Saved Searches" ) ).toBeOnTheScreen( );
    expect( AccessibilityInfo.announceForAccessibility )
      .toHaveBeenCalledWith( "Added to Saved Searches" );
  } );

  it( "shows the icon when one is given", ( ) => {
    render( <Toast icon="map-marker-outline" onHide={jest.fn( )} text="Using location" /> );

    const glyph = String.fromCodePoint( glyphmap["map-marker-outline"] );
    expect( screen.getByText( glyph ) ).toBeOnTheScreen( );
    expect( screen.getByText( "Using location" ) ).toBeOnTheScreen( );
  } );

  it( "calls onHide only after the full toast has played", ( ) => {
    const onHide = jest.fn( );
    render( <Toast onHide={onHide} text="Added to Saved Searches" /> );

    advance( ONE_TOAST - 100 );
    expect( onHide ).not.toHaveBeenCalled( );

    advance( 200 );
    expect( onHide ).toHaveBeenCalledTimes( 1 );
  } );

  it( "calls onHide right away when tapped", ( ) => {
    const onHide = jest.fn( );
    render( <Toast onHide={onHide} testID="toast" text="Added to Saved Searches" /> );

    fireEvent.press( screen.getByTestId( "toast" ) );

    expect( onHide ).toHaveBeenCalledTimes( 1 );
  } );

  it( "starts over instead of hiding early when the text changes mid-way", ( ) => {
    const onHide = jest.fn( );
    const { rerender } = render( <Toast onHide={onHide} text="Added to Saved Searches" /> );
    advance( 1000 );

    rerender( <Toast onHide={onHide} text="Removed from Saved Searches" /> );

    // 2500ms after mount: the first toast alone would have finished by now
    advance( 1500 );
    expect( onHide ).not.toHaveBeenCalled( );
    expect( screen.getByText( "Removed from Saved Searches" ) ).toBeOnTheScreen( );

    // 2500ms after the text change: the restarted toast has finished
    advance( 1000 );
    expect( onHide ).toHaveBeenCalledTimes( 1 );
  } );
} );
