import { act, fireEvent, screen } from "@testing-library/react-native";
import MentionTextInput from "components/SharedComponents/MentionTextInput";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "RemoteUser", { login: "kueda" } );

const mockUseUserSearch = jest.fn( ( query: string ) => ( {
  users: query
    ? [mockUser]
    : [],
  isLoading: false,
} ) );
jest.mock( "sharedHooks/useUserSearch", ( ) => ( {
  __esModule: true,
  default: ( query: string ) => mockUseUserSearch( query ),
} ) );

const mockSetNativeProps = jest.fn( );
const mockSetSelection = jest.fn( );

// The jest TextInput mock has no setSelection, so stand in for the native
// input's ref methods
const MockInput = forwardRef( ( props: TextInputProps, ref ) => {
  useImperativeHandle( ref, ( ) => ( {
    clear: jest.fn( ),
    setNativeProps: mockSetNativeProps,
    setSelection: mockSetSelection,
  } ) );
  return <TextInput {...props} />;
} );

const mockOnChangeText = jest.fn( );

const Harness = ( { initialValue = "" }: { initialValue?: string } ) => {
  const [value, setValue] = useState( initialValue );
  return (
    <MentionTextInput
      InputComponent={MockInput}
      currentValue={value}
      defaultValue={initialValue}
      onChangeText={text => {
        mockOnChangeText( text );
        setValue( text );
      }}
      testID="MentionTextInput.input"
    />
  );
};

const typeAt = ( text: string, cursor: number ) => {
  const input = screen.getByTestId( "MentionTextInput.input" );
  fireEvent.changeText( input, text );
  fireEvent( input, "selectionChange", {
    nativeEvent: { selection: { start: cursor, end: cursor } },
  } );
};

describe( "MentionTextInput", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
    jest.useFakeTimers( );
  } );

  afterEach( ( ) => {
    jest.useRealTimers( );
  } );

  it( "shows results for a mention at the end of the text", ( ) => {
    renderComponent( <Harness /> );
    typeAt( "hello @ku", 9 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    expect( mockUseUserSearch ).toHaveBeenLastCalledWith( "ku" );
    expect( screen.getByText( "kueda" ) ).toBeVisible( );
  } );

  it( "shows results for a mention in the middle of the text", ( ) => {
    renderComponent( <Harness initialValue="hello  and goodbye" /> );
    typeAt( "hello @ku and goodbye", 9 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    expect( mockUseUserSearch ).toHaveBeenLastCalledWith( "ku" );
    expect( screen.getByText( "kueda" ) ).toBeVisible( );
  } );

  it( "hides the list when the cursor moves out of the mention", ( ) => {
    renderComponent( <Harness /> );
    typeAt( "hello @ku and goodbye", 9 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    expect( screen.getByText( "kueda" ) ).toBeVisible( );
    fireEvent( screen.getByTestId( "MentionTextInput.input" ), "selectionChange", {
      nativeEvent: { selection: { start: 21, end: 21 } },
    } );
    expect( screen.queryByText( "kueda" ) ).toBeNull( );
  } );

  it( "inserts the selected user at the cursor and keeps the rest of the text", ( ) => {
    renderComponent( <Harness /> );
    typeAt( "hello @ku and goodbye", 9 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    fireEvent.press( screen.getByText( "kueda" ) );
    expect( mockSetNativeProps ).toHaveBeenCalledWith( { text: "hello @kueda and goodbye" } );
    expect( mockSetSelection ).toHaveBeenCalledWith( 13, 13 );
    expect( mockOnChangeText ).toHaveBeenLastCalledWith( "hello @kueda and goodbye" );
    expect( screen.queryByText( "kueda" ) ).toBeNull( );
  } );

  it( "keeps letters typed after the cursor", ( ) => {
    renderComponent( <Harness initialValue="hello and goodbye" /> );
    typeAt( "hello @kuand goodbye", 9 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    fireEvent.press( screen.getByText( "kueda" ) );
    expect( mockSetNativeProps ).toHaveBeenLastCalledWith( { text: "hello @kueda and goodbye" } );
    expect( mockSetSelection ).toHaveBeenCalledWith( 13, 13 );
  } );

  it( "applies the text when picking a user produces the same text as last time", ( ) => {
    renderComponent( <Harness /> );
    typeAt( "hi @ku", 6 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    fireEvent.press( screen.getByText( "kueda" ) );
    expect( mockSetNativeProps ).toHaveBeenCalledTimes( 1 );

    // Delete the mention back to "@ku" and pick the same user again
    typeAt( "hi @ku", 6 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    fireEvent.press( screen.getByText( "kueda" ) );
    expect( mockSetNativeProps ).toHaveBeenNthCalledWith( 2, { text: "hi @ku" } );
    expect( mockSetNativeProps ).toHaveBeenNthCalledWith( 3, { text: "hi @kueda " } );
  } );

  it( "closes the list after a pick when punctuation follows the mention", ( ) => {
    renderComponent( <Harness /> );
    typeAt( "@ku, thanks", 3 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    fireEvent.press( screen.getByText( "kueda" ) );
    expect( mockSetNativeProps ).toHaveBeenLastCalledWith( { text: "@kueda, thanks" } );
    expect( mockSetSelection ).toHaveBeenCalledWith( 6, 6 );
    // Android reports the cursor move from setSelection
    fireEvent( screen.getByTestId( "MentionTextInput.input" ), "selectionChange", {
      nativeEvent: { selection: { start: 6, end: 6 } },
    } );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    expect( screen.queryByText( "kueda" ) ).toBeNull( );
    expect( screen.queryByText( /No results/ ) ).toBeNull( );
  } );

  it( "reopens the list when the user keeps typing after a pick", ( ) => {
    renderComponent( <Harness /> );
    typeAt( "@ku, thanks", 3 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    fireEvent.press( screen.getByText( "kueda" ) );
    typeAt( "@kuedax, thanks", 7 );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    expect( mockUseUserSearch ).toHaveBeenLastCalledWith( "kuedax" );
    expect( screen.getByText( "kueda" ) ).toBeVisible( );
  } );
} );
