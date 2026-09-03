import {
  act, fireEvent, render, screen,
} from "@testing-library/react-native";
import Toast from "components/SharedComponents/Toast";
import React from "react";
import { AccessibilityInfo } from "react-native";

const LONGER_THAN_ONE_TOAST = 2000;

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
    render( <Toast onHide={jest.fn( )} text="ADDED TO SAVED SEARCHES" /> );

    expect( screen.getByText( "ADDED TO SAVED SEARCHES" ) ).toBeOnTheScreen( );
    expect( AccessibilityInfo.announceForAccessibility )
      .toHaveBeenCalledWith( "ADDED TO SAVED SEARCHES" );
  } );

  it( "calls onHide only after it has been shown for a while", ( ) => {
    const onHide = jest.fn( );
    render( <Toast onHide={onHide} text="ADDED TO SAVED SEARCHES" /> );

    advance( 500 );
    expect( onHide ).not.toHaveBeenCalled( );

    advance( LONGER_THAN_ONE_TOAST );
    expect( onHide ).toHaveBeenCalledTimes( 1 );
  } );

  it( "calls onHide right away when tapped", ( ) => {
    const onHide = jest.fn( );
    render( <Toast onHide={onHide} testID="toast" text="ADDED TO SAVED SEARCHES" /> );

    fireEvent.press( screen.getByTestId( "toast" ) );

    expect( onHide ).toHaveBeenCalledTimes( 1 );
  } );

  it( "starts over instead of hiding early when the text changes mid-way", ( ) => {
    const onHide = jest.fn( );
    const { rerender } = render( <Toast onHide={onHide} text="ADDED TO SAVED SEARCHES" /> );
    advance( 1000 );

    rerender( <Toast onHide={onHide} text="REMOVED FROM SAVED SEARCHES" /> );

    // Past the point where the first toast alone would have finished
    advance( 1000 );
    expect( onHide ).not.toHaveBeenCalled( );
    expect( screen.getByText( "REMOVED FROM SAVED SEARCHES" ) ).toBeOnTheScreen( );

    advance( LONGER_THAN_ONE_TOAST );
    expect( onHide ).toHaveBeenCalledTimes( 1 );
  } );
} );
