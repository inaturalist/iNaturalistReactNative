import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import Messages from "../../../../src/components/Messages/Messages";

import * as useMessages from "../../../../src/components/Messages/hooks/useMessages";

const mockedNavigate = jest.fn( );
const mockMessage = factory( "RemoteMessage" );

jest.mock( "../../../../src/components/Messages/hooks/useMessages" , ( ) => ( {
  __esModule: true,
  default: null
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

it( "displays activity indicator when loading", ( ) => {
  useMessages.default = ( ) => {
    return {
      messages: [],
      loading: true
    };
  };
  const { getByTestId } = renderMessages( );
  expect( getByTestId( "Messages.activityIndicator" ) ).toBeTruthy( );
} );

it( "displays message subject and not activity indicator when loading complete", ( ) => {
  console.log( "------1" );
  useMessages.default = ( ) => {
    return {
      messages: [mockMessage],
      loading: false
    };
  };
  const { getByText, queryByTestId } = renderMessages( );
  expect( getByText( mockMessage.subject ) ).toBeTruthy( );
  expect( queryByTestId( "Messages.activityIndicator" ) ).toBeNull( );
} );



