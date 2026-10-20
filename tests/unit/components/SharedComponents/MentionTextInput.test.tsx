import { act, fireEvent, screen } from "@testing-library/react-native";
import type { ApiUser } from "api/types";
import MentionTextInput from "components/SharedComponents/MentionTextInput";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "RemoteUser", { login: "kueda", name: "Ken-ichi Ueda" } );
const observer = factory( "RemoteUser", { login: "kirk", name: "Jim Kirk" } );
const commenter = factory( "RemoteUser", { login: "tiwane", name: "Tony Iwane" } );
const searchOnlyUser = factory( "RemoteUser", { login: "kimberly", name: "Kim B" } );

const defaultUserSearch = ( query: string ) => ( {
  users: query
    ? [mockUser]
    : [],
  isLoading: false,
} );
const mockUseUserSearch = jest.fn( defaultUserSearch );
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

interface HarnessProps {
  initialValue?: string;
  suggestedUsers?: ApiUser[];
}

const Harness = ( { initialValue = "", suggestedUsers }: HarnessProps ) => {
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
      suggestedUsers={suggestedUsers}
      testID="MentionTextInput.input"
    />
  );
};

const listedLogins = ( ) => screen
  .queryAllByText( /^[a-z0-9_-]+$/ )
  .map( node => node.props.children );

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
    mockUseUserSearch.mockImplementation( defaultUserSearch );
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

  describe( "with suggested users", ( ) => {
    it( "shows them as soon as a bare @ is typed", ( ) => {
      renderComponent( <Harness suggestedUsers={[observer, commenter]} /> );
      typeAt( "hi @", 4 );
      expect( listedLogins( ) ).toEqual( ["kirk", "tiwane"] );
      act( ( ) => { jest.advanceTimersByTime( 400 ); } );
      expect( mockUseUserSearch ).not.toHaveBeenCalledWith( expect.stringMatching( /.+/ ) );
    } );

    it( "shows nothing for a bare @ without suggestions", ( ) => {
      renderComponent( <Harness suggestedUsers={[]} /> );
      typeAt( "hi @", 4 );
      act( ( ) => { jest.advanceTimersByTime( 400 ); } );
      expect( listedLogins( ) ).toEqual( [] );
      expect( screen.queryByText( /No results/ ) ).toBeNull( );
    } );

    it( "filters them by login or name before the search runs", ( ) => {
      renderComponent( <Harness suggestedUsers={[observer, commenter]} /> );
      typeAt( "@K", 2 );
      expect( listedLogins( ) ).toEqual( ["kirk"] );
      typeAt( "@To", 3 );
      expect( listedLogins( ) ).toEqual( ["tiwane"] );
    } );

    it( "adds search results below them without duplicates", ( ) => {
      mockUseUserSearch.mockImplementation( query => ( {
        users: query
          ? [mockUser, searchOnlyUser]
          : [],
        isLoading: false,
      } ) );
      renderComponent( <Harness suggestedUsers={[mockUser, observer]} /> );
      typeAt( "@k", 2 );
      act( ( ) => { jest.advanceTimersByTime( 400 ); } );
      expect( listedLogins( ) ).toEqual( ["kueda", "kirk", "kimberly"] );
    } );

    it( "caps the list", ( ) => {
      const manyUsers = Array.from( { length: 12 }, ( _, index ) => factory( "RemoteUser", {
        login: `user${index}`,
        name: "Someone",
      } ) );
      renderComponent( <Harness suggestedUsers={manyUsers} /> );
      typeAt( "@", 1 );
      expect( listedLogins( ) ).toHaveLength( 10 );
    } );

    it( "inserts a picked suggestion", ( ) => {
      renderComponent( <Harness suggestedUsers={[observer]} /> );
      typeAt( "thanks @", 8 );
      fireEvent.press( screen.getByText( "kirk" ) );
      expect( mockSetNativeProps ).toHaveBeenLastCalledWith( { text: "thanks @kirk " } );
      expect( listedLogins( ) ).toEqual( [] );
    } );
  } );

  it( "shows a spinner instead of no results while the search is pending", ( ) => {
    mockUseUserSearch.mockImplementation( ( ) => ( { users: [], isLoading: false } ) );
    renderComponent( <Harness /> );
    typeAt( "@zz", 3 );
    expect( screen.queryByText( /No results/ ) ).toBeNull( );
    act( ( ) => { jest.advanceTimersByTime( 400 ); } );
    expect( screen.getByText( /No results/ ) ).toBeVisible( );
  } );
} );
