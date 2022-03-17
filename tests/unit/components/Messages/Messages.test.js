import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import Messages from "../../../../src/components/Messages/Messages";

const mockedNavigate = jest.fn( );
const mockMessage = factory( "RemoteMessage" );

jest.mock( "../../../../src/components/Messages/hooks/useMessages" , ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return {
      messages: [mockMessage],
      loading: false
    };
  }
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

it( "displays message subject", ( ) => {
  const { getByText } = renderMessages( );
  expect( getByText( mockMessage.subject ) ).toBeTruthy( );
} );

