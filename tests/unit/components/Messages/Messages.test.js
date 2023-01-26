import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import Messages from "components/Messages/Messages";
import React from "react";

import factory from "../../../factory";

const mockedNavigate = jest.fn( );
const mockMessage = factory( "RemoteMessage" );
const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

jest.useFakeTimers();

const renderMessages = ( ) => render(
  <NavigationContainer>
    <Messages />
  </NavigationContainer>
);

// We need to do some weird stuff to test results that vary based on useQuery
// return values. We can't use jest.mock to totally change the mock
// definition within a test, so instead we mock the module once and tell it
// to return an object literal attribute in response to useQuery. That would
// be a serious problem if tests get run in parallel because you can't really
// control what that value is for that specific test. To address this, we
// take advantage of the fact that Jest seems to run describe blocks
// sequentially, or at least it doesn't seem to allow tests within a describe
// block to access data from other describe blocks. Whatever's happening,
// using a single mocked return value for useQuery within a describe block
// seems to work.
const MockData = { useQueryResponse: {} };
jest.mock( "@tanstack/react-query", ( ) => ( {
  useQuery: ( ) => ( MockData.useQueryResponse )
} ) );

describe( "when loading", ( ) => {
  beforeAll( ( ) => {
    MockData.useQueryResponse = {
      data: [],
      isLoading: true,
      isError: false
    };
  } );
  it( "displays activity indicator when loading", ( ) => {
    const { getByTestId } = renderMessages( );
    expect( getByTestId( "Messages.activityIndicator" ) ).toBeTruthy( );
  } );
} );

describe( "when loading complete", ( ) => {
  beforeAll( ( ) => {
    MockData.useQueryResponse = {
      data: [mockMessage],
      isLoading: false,
      isError: false
    };
  } );
  it( "displays message subject and not activity indicator when loading complete", ( ) => {
    const { getByText, queryByTestId } = renderMessages( );
    expect( getByText( mockMessage.subject ) ).toBeTruthy( );
    expect( queryByTestId( "Messages.activityIndicator" ) ).toBeNull( );
  } );
} );
