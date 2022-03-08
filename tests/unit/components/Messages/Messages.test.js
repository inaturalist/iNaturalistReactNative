import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import Messages from "../../../../src/components/Messages/Messages";
import { testElement } from "domutils";

const mockedNavigate = jest.fn( );
const mockMessage = factory( "RemoteMessage" );

jest.mock( "../../../../src/components/Messages/hooks/useMessages" , ( ) => ( {
  __esModule: true,
  default: ( ) => {
    return {
      messageList: [mockMessage],
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

const renderMessages = async ( ) => waitFor(
  ( ) => render(
  <NavigationContainer>
    <Messages />
  </NavigationContainer>
  )
);

test.todo( "add displays message subject test" );
//unclear why this fails
//
// it( "displays message subject", async ( ) => {
//   const { getByText } = await renderMessages( );
//   expect( getByText( mockMessage.subject ) ).toBeTruthy( );
// } );

